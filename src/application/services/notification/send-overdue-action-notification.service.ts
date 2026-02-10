import { PhoneValidator } from '@/core/domain/shared/phone-validator';
import type { SmsService } from '@/core/ports/services/sms-service.port';
import type { WhatsappService } from '@/core/ports/services/whatsapp-service.port';
import {
  buildOverdueActionSmsBody,
  buildOverdueActionVariables,
  type OverdueActionSmsParams,
} from '@/infra/services/sms/overdue-action.templates';
import { Inject, Injectable, Logger } from '@nestjs/common';

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
  ) {}

  async execute(
    phone: string,
    params: OverdueActionSmsParams,
  ): Promise<{ smsSent: boolean; whatsappSent: boolean }> {
    const trimmedPhone = phone?.trim();
    if (!trimmedPhone || trimmedPhone.startsWith(TEMP_PHONE_PREFIX)) {
      this.logger.debug(
        `Telefone ignorado para notificação: ${trimmedPhone ? 'temporário (temp_)' : 'vazio'}`,
      );
      return { smsSent: false, whatsappSent: false };
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = PhoneValidator.normalize(trimmedPhone);
    } catch (err) {
      this.logger.warn(
        `Telefone inválido para notificação: ${trimmedPhone} - ${err instanceof Error ? err.message : err}`,
      );
      return { smsSent: false, whatsappSent: false };
    }

    // 3. Prepara mensagens
    const variables = buildOverdueActionVariables(params);
    const message = buildOverdueActionSmsBody(params);

    // 4. Envia SMS e WhatsApp em paralelo usando Promise.allSettled
    const [smsResult, whatsappResult] = await Promise.allSettled([
      this.smsService.sendSms({ to: normalizedPhone, message }),
      this.whatsappService.sendMessage({
        to: normalizedPhone,
        templateKey: 'OVERDUE_ACTION',
        variables,
      }),
    ]);

    // 5. Processa resultados
    const smsSent = smsResult.status === 'fulfilled';
    const whatsappSent = whatsappResult.status === 'fulfilled';

    if (smsResult.status === 'rejected') {
      this.logger.warn(
        `Falha ao enviar SMS para ${normalizedPhone}: ${smsResult.reason?.message || smsResult.reason}`,
      );
    }

    if (whatsappResult.status === 'rejected') {
      this.logger.warn(
        `Falha ao enviar WhatsApp para ${normalizedPhone}: ${whatsappResult.reason?.message || whatsappResult.reason}`,
      );
    }

    return { smsSent, whatsappSent };
  }
}
