import { PrismaService } from '@/infrastructure/database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ActionPriority } from '@prisma/client';
import { AISuggestionDto } from '../dto/ai-suggestion.dto';

@Injectable()
export class AISuggestionService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AISuggestionService.name);

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    this.logger.debug(`API Key length: ${apiKey?.length || 0}`);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateActionSuggestion(description: string): Promise<AISuggestionDto> {
    try {
      this.logger.debug('Iniciando geração de sugestão...');
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.logger.debug('Modelo carregado com sucesso');

      const prompt = `
        Com base na seguinte descrição, crie uma sugestão de ação com título, descrição detalhada, uma prioridade geral e checklist de tarefas.
        A resposta deve ser em formato JSON com a seguinte estrutura:
        {
          "title": "título da ação",
          "description": "descrição detalhada",
          "priority": "HIGH|MEDIUM|LOW",
          "checklistItems": [
            {
              "description": "descrição da tarefa"
            }
          ]
        }

        Descrição: ${description}

        Considere:
        - O título deve ser conciso e direto
        - A descrição deve explicar o objetivo e contexto
        - O checklist deve ter 4-6 itens
        - A prioridade geral deve ser:
          * HIGH: para ações críticas e urgentes
          * MEDIUM: para ações importantes mas não urgentes
          * LOW: para ações complementares ou de melhoria
      `;

      this.logger.debug('Enviando prompt para a API...');
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      });
      this.logger.debug('Resposta recebida da API');
      
      const response = await result.response;
      const text = response.text();
      this.logger.debug('Texto extraído da resposta');
      
      // Extrai o JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.error('Resposta não contém JSON válido');
        throw new Error('Resposta inválida da IA');
      }

      const suggestion = JSON.parse(jsonMatch[0]) as AISuggestionDto;
      this.logger.debug('JSON parseado com sucesso');

      // Valida a prioridade geral
      suggestion.priority = this.validatePriority(suggestion.priority);

      return suggestion;
    } catch (error) {
      this.logger.error(`Erro ao gerar sugestão: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validatePriority(priority: string): ActionPriority {
    const validPriorities = Object.values(ActionPriority);
    return validPriorities.includes(priority as ActionPriority)
      ? (priority as ActionPriority)
      : ActionPriority.MEDIUM;
  }
} 