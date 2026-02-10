import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export enum NotificationType {
  OVERDUE_SMS = 'overdue_sms',
  OVERDUE_WHATSAPP = 'overdue_whatsapp',
}

export class ActionNotification extends Entity {
  constructor(
    public readonly id: string,
    public readonly actionId: string,
    public readonly userId: string,
    public readonly notificationType: NotificationType,
    public readonly sentAt: Date,
    public readonly smsSent: boolean,
    public readonly whatsappSent: boolean,
    public readonly lateStatus: string | null,
    public readonly createdAt: Date = new Date(),
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return 'ID da notificação é obrigatório';
  }

  protected validate(): void {
    DomainValidator.validateRequiredId(
      this.actionId,
      'ID da ação é obrigatório',
    );
    DomainValidator.validateRequiredId(
      this.userId,
      'ID do usuário é obrigatório',
    );
    DomainValidator.validateDate(this.sentAt, 'Data de envio inválida');
  }

  /**
   * Verifica se a notificação foi enviada com sucesso (pelo menos um canal).
   */
  public wasSuccessful(): boolean {
    return this.smsSent || this.whatsappSent;
  }

  /**
   * Verifica se a notificação foi enviada hoje.
   */
  public isSentToday(referenceDate: Date = new Date()): boolean {
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);

    const sentDay = new Date(this.sentAt);
    sentDay.setHours(0, 0, 0, 0);

    return sentDay.getTime() === today.getTime();
  }
}
