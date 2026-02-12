import type { ActionNotification } from '@/core/domain/action/action-notification.entity';
import type { NotificationType } from '@/core/domain/action/action-notification.entity';

export interface NotificationWithTitle {
  id: string;
  actionId: string;
  actionTitle: string;
  userId: string;
  notificationType: NotificationType;
  sentAt: Date;
  smsSent: boolean;
  whatsappSent: boolean;
  lateStatus: string | null;
}

export interface ActionNotificationRepository {
  /**
   * Cria um registro de notificação.
   */
  create(
    notification: ActionNotification,
    tx?: unknown,
  ): Promise<ActionNotification>;

  /**
   * Verifica se já foi enviada uma notificação hoje para uma ação e usuário.
   * Usa a data atual do servidor ou uma data de referência.
   */
  wasSentToday(
    actionId: string,
    userId: string,
    referenceDate?: Date,
  ): Promise<boolean>;

  /**
   * Busca a última notificação enviada para uma ação e usuário.
   */
  findLastSent(
    actionId: string,
    userId: string,
  ): Promise<ActionNotification | null>;

  /**
   * Busca todas as notificações de uma ação.
   */
  findByActionId(actionId: string): Promise<ActionNotification[]>;

  /**
   * Busca todas as notificações de um usuário.
   */
  findByUserId(userId: string): Promise<ActionNotification[]>;

  /**
   * Busca as últimas notificações de um usuário com o título da ação.
   */
  findByUserIdWithTitle(userId: string, limit?: number): Promise<NotificationWithTitle[]>;
}
