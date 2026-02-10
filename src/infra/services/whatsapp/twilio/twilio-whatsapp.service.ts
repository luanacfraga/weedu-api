import type {
  SendWhatsappMessageInput,
  WhatsappService,
} from '@/core/ports/services/whatsapp-service.port';
import { withRetry } from '@/infra/services/shared/retry.helper';
import { TEMPLATE_PLACEHOLDERS } from '@/infra/services/sms/overdue-action.templates';
import { TwilioConfig } from '@/infra/services/twilio/twilio.config';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

const WHATSAPP_TIMEOUT_MS = 10000;

@Injectable()
export class TwilioWhatsappServiceImpl implements WhatsappService {
  private readonly logger = new Logger(TwilioWhatsappServiceImpl.name);
  private readonly client: twilio.Twilio;

  constructor(private readonly twilioConfig: TwilioConfig) {
    this.client = twilio(
      this.twilioConfig.accountSid,
      this.twilioConfig.authToken,
    );
  }

  async sendMessage({
    templateKey,
    to,
    variables,
  }: SendWhatsappMessageInput): Promise<void> {
    const placeholders = TEMPLATE_PLACEHOLDERS[templateKey];
    if (variables.length !== placeholders) {
      throw new BadRequestException(
        `Template "${templateKey}": esperadas ${placeholders} variáveis, recebidas ${variables.length}.`,
      );
    }

    await withRetry(
      () => this.sendWhatsappWithTimeout(templateKey, to, variables),
      {
        maxRetries: 3,
        delayMs: 1000,
        exponentialBackoff: true,
        logger: this.logger,
        operationName: `WhatsApp to ${to}`,
      },
    );

    this.logger.log(`WhatsApp enviado com sucesso para ${to}`);
  }

  private async sendWhatsappWithTimeout(
    templateKey: SendWhatsappMessageInput['templateKey'],
    to: string,
    variables: string[],
  ): Promise<void> {
    const contentVariables: Record<string, string> = {};
    variables.forEach((value, index) => {
      contentVariables[(index + 1).toString()] = value;
    });

    const contentSid = this.twilioConfig.getWhatsappContentSid(templateKey);
    const from = this.twilioConfig.getWhatsappFrom();

    const sendPromise = this.client.messages.create({
      contentSid,
      contentVariables: JSON.stringify(contentVariables),
      from,
      to: `whatsapp:${to}`,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(new Error(`WhatsApp timeout após ${WHATSAPP_TIMEOUT_MS}ms`)),
        WHATSAPP_TIMEOUT_MS,
      );
    });

    await Promise.race([sendPromise, timeoutPromise]);
  }
}
