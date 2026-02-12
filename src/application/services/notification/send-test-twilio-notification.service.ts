import { PhoneValidator } from '@/core/domain/shared/phone-validator';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { WhatsappService } from '@/core/ports/services/whatsapp-service.port';
import { Inject, Injectable, Logger } from '@nestjs/common';

const TEMP_PHONE_PREFIX = 'temp_';
// const TEST_MESSAGE =
//   'ToolDo - Teste de notificação Twilio. Se você recebeu esta mensagem, o envio está funcionando.';

export interface SendTestTwilioResult {
  sent: boolean;
  message: string;
}

@Injectable()
export class SendTestTwilioNotificationService {
  private readonly logger = new Logger(SendTestTwilioNotificationService.name);

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    // @Inject('SmsService')
    // private readonly smsService: SmsService,
    @Inject('WhatsappService')
    private readonly whatsappService: WhatsappService,
  ) {}

  /**
   * Envia um SMS de teste via Twilio para o telefone do usuário (admin).
   * Uso exclusivo para testes, apenas para usuários com role ADMIN.
   */
  async execute(userId: string): Promise<SendTestTwilioResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { sent: false, message: 'Usuário não encontrado.' };
    }

    const trimmedPhone = user.phone?.trim();
    if (!trimmedPhone || trimmedPhone.startsWith(TEMP_PHONE_PREFIX)) {
      return {
        sent: false,
        message:
          'Cadastre um telefone válido no seu perfil para receber o SMS de teste.',
      };
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = PhoneValidator.normalize(trimmedPhone);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Telefone inválido para teste: ${trimmedPhone} - ${errorMessage}`,
      );
      return {
        sent: false,
        message: `Telefone inválido. Use formato E.164 (ex: +5511999999999). Detalhe: ${errorMessage}`,
      };
    }

    try {
      await this.whatsappService.sendMessage({
        to: normalizedPhone,
        templateKey: 'OVERDUE_ACTION',
        variables: [
          'Teste de notificação WhatsApp',
          'Atrasada para iniciar',
          new Date().toLocaleDateString('pt-BR'),
        ],
      });
      this.logger.log(
        `WPP de teste enviado para ${normalizedPhone} (usuário ${userId})`,
      );
      return {
        sent: true,
        message: 'SMS de teste enviado com sucesso para o seu telefone.',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Erro ao enviar SMS de teste: ${errorMessage}`);
      return {
        sent: false,
        message: `Falha ao enviar SMS: ${errorMessage}`,
      };
    }
  }
}
