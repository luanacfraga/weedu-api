import { NotificationPreference } from '@/core/domain/shared/enums';
import { PhoneValidator } from '@/core/domain/shared/phone-validator';
import type { SmsService } from '@/core/ports/services/sms-service.port';
import type { WhatsappService } from '@/core/ports/services/whatsapp-service.port';
import {
  buildActionCompletedSmsBody,
  buildActionCompletedVariables,
  buildActionStartedSmsBody,
  buildActionStartedVariables,
  type ActionCompletedSmsParams,
  type ActionStartedSmsParams,
} from '@/infra/services/sms/action-notification.templates';
import { Inject, Injectable, Logger } from '@nestjs/common';

const TEMP_PHONE_PREFIX = 'temp_';

@Injectable()
export class SendActionLifecycleNotificationService {
  private readonly logger = new Logger(
    SendActionLifecycleNotificationService.name,
  );

  constructor(
    @Inject('SmsService')
    private readonly smsService: SmsService,
    @Inject('WhatsappService')
    private readonly whatsappService: WhatsappService,
  ) {}

  private async sendToPhone(
    phone: string,
    userId: string,
    preference: NotificationPreference | undefined,
    buildMessage: (isWhatsapp: boolean) => string,
    buildVariables: () => string[],
    templateKey: 'ACTION_STARTED' | 'ACTION_COMPLETED',
  ): Promise<{ smsSent: boolean; whatsappSent: boolean }> {
    const trimmedPhone = phone?.trim();
    if (!trimmedPhone || trimmedPhone.startsWith(TEMP_PHONE_PREFIX)) {
      this.logger.debug(
        `Telefone ignorado para notificação: ${trimmedPhone ? 'temporário' : 'vazio'}`,
      );
      return { smsSent: false, whatsappSent: false };
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = PhoneValidator.normalize(trimmedPhone);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Telefone inválido para notificação: ${trimmedPhone} - ${msg}`,
      );
      return { smsSent: false, whatsappSent: false };
    }

    const pref = preference ?? NotificationPreference.BOTH;
    const sendSms = pref !== NotificationPreference.WHATSAPP_ONLY;
    const sendWhatsapp = pref !== NotificationPreference.SMS_ONLY;

    const variables = buildVariables();
    const message = buildMessage(false);

    const [smsResult, whatsappResult] = await Promise.allSettled([
      sendSms
        ? this.smsService.sendSms({ to: normalizedPhone, message })
        : Promise.reject(new Error('SMS desativado')),
      sendWhatsapp
        ? this.whatsappService.sendMessage({
            to: normalizedPhone,
            templateKey,
            variables,
          })
        : Promise.reject(new Error('WhatsApp desativado')),
    ]);

    const smsSent = smsResult.status === 'fulfilled';
    const whatsappSent = whatsappResult.status === 'fulfilled';

    if (smsResult.status === 'rejected' && sendSms) {
      this.logger.warn(
        `Falha SMS ${templateKey} para ${normalizedPhone}: ${smsResult.reason}`,
      );
    }
    if (whatsappResult.status === 'rejected' && sendWhatsapp) {
      this.logger.warn(
        `Falha WhatsApp ${templateKey} para ${normalizedPhone}: ${whatsappResult.reason}`,
      );
    }

    if (smsSent || whatsappSent) {
      this.logger.log(
        `Notificação ${templateKey} enviada para ${userId}: SMS=${smsSent}, WhatsApp=${whatsappSent}`,
      );
    }

    return { smsSent, whatsappSent };
  }

  /**
   * Envia notificação de ação iniciada (SMS + WhatsApp) ao responsável.
   */
  async sendActionStarted(
    _actionId: string,
    userId: string,
    phone: string,
    params: ActionStartedSmsParams,
    notificationPreference?: NotificationPreference,
  ): Promise<{ smsSent: boolean; whatsappSent: boolean }> {
    return this.sendToPhone(
      phone,
      userId,
      notificationPreference,
      (isWa) => buildActionStartedSmsBody(params, isWa),
      () => buildActionStartedVariables(params),
      'ACTION_STARTED',
    );
  }

  /**
   * Envia notificação de ação concluída (SMS + WhatsApp) ao responsável.
   */
  async sendActionCompleted(
    _actionId: string,
    userId: string,
    phone: string,
    params: ActionCompletedSmsParams,
    notificationPreference?: NotificationPreference,
  ): Promise<{ smsSent: boolean; whatsappSent: boolean }> {
    return this.sendToPhone(
      phone,
      userId,
      notificationPreference,
      (isWa) => buildActionCompletedSmsBody(params, isWa),
      () => buildActionCompletedVariables(params),
      'ACTION_COMPLETED',
    );
  }
}
