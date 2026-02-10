import {
  ActionNotification,
  NotificationType,
} from '@/core/domain/action/action-notification.entity';
import { PhoneValidator } from '@/core/domain/shared/phone-validator';
import type { ActionNotificationRepository } from '@/core/ports/repositories/action-notification.repository';
import type { SmsService } from '@/core/ports/services/sms-service.port';
import type { WhatsappService } from '@/core/ports/services/whatsapp-service.port';
import {
  buildOverdueActionSmsBody,
  buildOverdueActionVariables,
  type OverdueActionSmsParams,
} from '@/infra/services/sms/overdue-action.templates';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

const TEMP_PHONE_PREFIX = 'temp_';

@Injectable()
export class SendOverdueActionNotificationService {
  private readonly logger = new Logger(
    SendOverdueActionNotificationService.name,
  );

  constructor(
    @Inject('SmsService')
    private readonly smsService: SmsService,
    @Inject('WhatsappService')
    private readonly whatsappService: WhatsappService,
    @Inject('ActionNotificationRepository')
    private readonly actionNotificationRepository: ActionNotificationRepository,
  ) {}

  /**
   * Envia notificação de ação atrasada por SMS e WhatsApp em paralelo.
   * Previne duplicação verificando se já foi enviada notificação hoje para a mesma ação/usuário.
   */
  async execute(
    actionId: string,
    userId: string,
    phone: string,
    params: OverdueActionSmsParams,
  ): Promise<{ smsSent: boolean; whatsappSent: boolean }> {
    // 1. Validação de telefone temporário ou vazio
    const trimmedPhone = phone?.trim();
    if (!trimmedPhone || trimmedPhone.startsWith(TEMP_PHONE_PREFIX)) {
      this.logger.debug(
        `Telefone ignorado para notificação: ${trimmedPhone ? 'temporário (temp_)' : 'vazio'}`,
      );
      return { smsSent: false, whatsappSent: false };
    }

    // 2. Validação de formato E.164
    let normalizedPhone: string;
    try {
      normalizedPhone = PhoneValidator.normalize(trimmedPhone);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Telefone inválido para notificação: ${trimmedPhone} - ${errorMessage}`,
      );
      return { smsSent: false, whatsappSent: false };
    }

    // 3. Verificar se já enviou notificação hoje (prevenir duplicação)
    const alreadySentToday =
      await this.actionNotificationRepository.wasSentToday(actionId, userId);

    if (alreadySentToday) {
      this.logger.debug(
        `Notificação já enviada hoje para ação ${actionId} (usuário ${userId})`,
      );
      return { smsSent: false, whatsappSent: false };
    }

    // 4. Prepara mensagens
    const variables = buildOverdueActionVariables(params);
    const message = buildOverdueActionSmsBody(params);

    // 5. Envia SMS e WhatsApp em paralelo usando Promise.allSettled
    const [smsResult, whatsappResult] = await Promise.allSettled([
      this.smsService.sendSms({ to: normalizedPhone, message }),
      this.whatsappService.sendMessage({
        to: normalizedPhone,
        templateKey: 'OVERDUE_ACTION',
        variables,
      }),
    ]);

    // 6. Processa resultados
    const smsSent = smsResult.status === 'fulfilled';
    const whatsappSent = whatsappResult.status === 'fulfilled';

    if (smsResult.status === 'rejected') {
      const errorMessage =
        smsResult.reason?.message ?? String(smsResult.reason);
      this.logger.warn(
        `Falha ao enviar SMS para ${normalizedPhone}: ${errorMessage}`,
      );
    }

    if (whatsappResult.status === 'rejected') {
      const errorMessage =
        whatsappResult.reason?.message ?? String(whatsappResult.reason);
      this.logger.warn(
        `Falha ao enviar WhatsApp para ${normalizedPhone}: ${errorMessage}`,
      );
    }

    // 7. Registra notificação enviada no histórico
    if (smsSent || whatsappSent) {
      try {
        const notification = new ActionNotification(
          randomUUID(),
          actionId,
          userId,
          NotificationType.OVERDUE_SMS,
          new Date(),
          smsSent,
          whatsappSent,
          params.lateStatus,
        );

        await this.actionNotificationRepository.create(notification);

        this.logger.log(
          `Notificação registrada: ação ${actionId}, usuário ${userId}, SMS=${smsSent}, WhatsApp=${whatsappSent}`,
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Falha ao registrar notificação no histórico: ${errorMessage}`,
        );
      }
    }

    return { smsSent, whatsappSent };
  }
}
