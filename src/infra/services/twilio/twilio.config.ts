import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioConfig {
  readonly accountSid: string;
  readonly authToken: string;
  readonly phoneNumber: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.getRequired('TWILIO_ACCOUNT_SID');
    this.authToken = this.getRequired('TWILIO_AUTH_TOKEN');
    this.phoneNumber = this.getRequired('TWILIO_PHONE_NUMBER');
  }

  getWhatsappFrom(): string {
    return `whatsapp:${this.phoneNumber}`;
  }

  private getRequired(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(
        `Configuração Twilio ausente: a variável de ambiente "${key}" é obrigatória.`,
      );
    }
    return value;
  }
}
