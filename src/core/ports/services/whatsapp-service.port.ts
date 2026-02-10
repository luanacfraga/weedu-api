export type WhatsappTemplateKey = 'OVERDUE_ACTION';

export interface SendWhatsappMessageInput {
  to: string;
  templateKey: WhatsappTemplateKey;
  variables: string[];
}

export interface WhatsappService {
  sendMessage(input: SendWhatsappMessageInput): Promise<void>;
}
