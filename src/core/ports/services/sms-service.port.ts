export interface SendSmsInput {
  to: string;
  message: string;
}

export interface SmsService {
  sendSms(input: SendSmsInput): Promise<void>;
}
