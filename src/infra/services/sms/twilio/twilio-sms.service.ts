import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

import type {
  SendSmsInput,
  SmsService,
} from '@/core/ports/services/sms-service.port';
import { withRetry } from '@/infra/services/shared/retry.helper';
import { TwilioConfig } from '@/infra/services/twilio/twilio.config';

const SMS_TIMEOUT_MS = 10000;

@Injectable()
export class TwilioSmsServiceImpl implements SmsService {
  private readonly logger = new Logger(TwilioSmsServiceImpl.name);
  private readonly client: twilio.Twilio;

  constructor(private readonly twilioConfig: TwilioConfig) {
    this.client = twilio(
      this.twilioConfig.accountSid,
      this.twilioConfig.authToken,
    );
  }

  async sendSms({ message, to }: SendSmsInput): Promise<void> {
    await withRetry(() => this.sendSmsWithTimeout(message, to), {
      maxRetries: 3,
      delayMs: 1000,
      exponentialBackoff: true,
      logger: this.logger,
      operationName: `SMS to ${to}`,
    });

    this.logger.log(`SMS enviado com sucesso para ${to}`);
  }

  private async sendSmsWithTimeout(message: string, to: string): Promise<void> {
    const sendPromise = this.client.messages.create({
      body: message,
      from: this.twilioConfig.phoneNumber,
      to,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`SMS timeout após ${SMS_TIMEOUT_MS}ms`)),
        SMS_TIMEOUT_MS,
      );
    });

    await Promise.race([sendPromise, timeoutPromise]);
  }
}
