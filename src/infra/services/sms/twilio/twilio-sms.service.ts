import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

import type {
  SendSmsInput,
  SmsService,
} from '@/core/ports/services/sms-service.port';

@Injectable()
export class TwilioSmsServiceImpl implements SmsService {
  private client: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    this.client = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendSms({ message, to }: SendSmsInput): Promise<void> {
    await this.client.messages.create({
      body: message,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to,
    });
  }
}
