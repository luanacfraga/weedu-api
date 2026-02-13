import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { WhatsappTemplateKey } from '@/core/ports/services/whatsapp-service.port';

@Injectable()
export class TwilioConfig {
  readonly accountSid: string;
  readonly authToken: string;
  readonly phoneNumber: string;
  readonly whatsappContentSids: Map<WhatsappTemplateKey, string>;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.getRequired('TWILIO_ACCOUNT_SID');
    this.authToken = this.getRequired('TWILIO_AUTH_TOKEN');
    this.phoneNumber = this.getRequired('TWILIO_PHONE_NUMBER');

    this.whatsappContentSids = new Map<WhatsappTemplateKey, string>([
      [
        'OVERDUE_ACTION',
        this.configService.get('TWILIO_WHATSAPP_OVERDUE_ACTION_CONTENT_SID') ??
          '',
      ],
      [
        'ACTION_STARTED',
        this.configService.get('TWILIO_WHATSAPP_ACTION_STARTED_CONTENT_SID') ??
          '',
      ],
      [
        'ACTION_COMPLETED',
        this.configService.get(
          'TWILIO_WHATSAPP_ACTION_COMPLETED_CONTENT_SID',
        ) ?? '',
      ],
    ]);
  }

  getWhatsappContentSid(templateKey: WhatsappTemplateKey): string {
    const sid = this.whatsappContentSids.get(templateKey);
    if (!sid) {
      throw new Error(
        `WhatsApp Content SID não configurado para o template "${templateKey}". ` +
          `Verifique a variável de ambiente TWILIO_WHATSAPP_${templateKey}_CONTENT_SID.`,
      );
    }
    return sid;
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
