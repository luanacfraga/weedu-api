"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AISuggestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISuggestionService = void 0;
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const generative_ai_1 = require("@google/generative-ai");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AISuggestionService = AISuggestionService_1 = class AISuggestionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AISuggestionService_1.name);
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        this.logger.debug(`API Key length: ${apiKey?.length || 0}`);
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateActionSuggestion(description) {
        try {
            this.logger.debug('Iniciando geração de sugestão...');
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            this.logger.debug('Modelo carregado com sucesso');
            const prompt = `
        Com base na seguinte descrição, crie uma sugestão de ação com título, descrição detalhada e checklist de tarefas.
        A resposta deve ser em formato JSON com a seguinte estrutura:
        {
          "title": "título da ação",
          "description": "descrição detalhada",
          "checklistItems": [
            {
              "description": "descrição da tarefa",
              "priority": "HIGH|MEDIUM|LOW"
            }
          ]
        }

        Descrição: ${description}

        Considere:
        - O título deve ser conciso e direto
        - A descrição deve explicar o objetivo e contexto
        - O checklist deve ter 4-6 itens com prioridades apropriadas
        - Use prioridades HIGH para tarefas críticas, MEDIUM para importantes e LOW para complementares
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
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                this.logger.error('Resposta não contém JSON válido');
                throw new Error('Resposta inválida da IA');
            }
            const suggestion = JSON.parse(jsonMatch[0]);
            this.logger.debug('JSON parseado com sucesso');
            suggestion.checklistItems = suggestion.checklistItems.map(item => ({
                ...item,
                priority: this.validatePriority(item.priority),
            }));
            return suggestion;
        }
        catch (error) {
            this.logger.error(`Erro ao gerar sugestão: ${error.message}`, error.stack);
            throw error;
        }
    }
    validatePriority(priority) {
        const validPriorities = Object.values(client_1.ActionPriority);
        return validPriorities.includes(priority)
            ? priority
            : client_1.ActionPriority.MEDIUM;
    }
};
exports.AISuggestionService = AISuggestionService;
exports.AISuggestionService = AISuggestionService = AISuggestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AISuggestionService);
//# sourceMappingURL=ai-suggestion.service.js.map