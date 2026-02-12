import {
  ActionNotification,
  NotificationType,
} from '@/core/domain/action/action-notification.entity';
import type { ActionNotificationRepository, NotificationWithTitle } from '@/core/ports/repositories/action-notification.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  ActionNotification as PrismaActionNotification,
  NotificationType as PrismaNotificationType,
} from '@prisma/client';

@Injectable()
export class ActionNotificationPrismaRepository implements ActionNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapNotificationTypeToPrisma(
    type: NotificationType,
  ): PrismaNotificationType {
    switch (type) {
      case NotificationType.OVERDUE_SMS:
        return PrismaNotificationType.OVERDUE_SMS;
      case NotificationType.OVERDUE_WHATSAPP:
        return PrismaNotificationType.OVERDUE_WHATSAPP;
    }
  }

  private mapNotificationTypeToDomain(
    type: PrismaNotificationType,
  ): NotificationType {
    switch (type) {
      case PrismaNotificationType.OVERDUE_SMS:
        return NotificationType.OVERDUE_SMS;
      case PrismaNotificationType.OVERDUE_WHATSAPP:
        return NotificationType.OVERDUE_WHATSAPP;
    }
  }

  async create(
    notification: ActionNotification,
    tx?: unknown,
  ): Promise<ActionNotification> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.actionNotification.create({
      data: {
        id: notification.id,
        actionId: notification.actionId,
        userId: notification.userId,
        notificationType: this.mapNotificationTypeToPrisma(
          notification.notificationType,
        ),
        sentAt: notification.sentAt,
        smsSent: notification.smsSent,
        whatsappSent: notification.whatsappSent,
        lateStatus: notification.lateStatus,
        createdAt: notification.createdAt,
      },
    });

    return this.mapToDomain(created);
  }

  async wasSentToday(
    actionId: string,
    userId: string,
    referenceDate: Date = new Date(),
  ): Promise<boolean> {
    const startOfDay = new Date(referenceDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(referenceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.prisma.actionNotification.count({
      where: {
        actionId,
        userId,
        sentAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return count > 0;
  }

  async findLastSent(
    actionId: string,
    userId: string,
  ): Promise<ActionNotification | null> {
    const notification = await this.prisma.actionNotification.findFirst({
      where: {
        actionId,
        userId,
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return notification ? this.mapToDomain(notification) : null;
  }

  async findByActionId(actionId: string): Promise<ActionNotification[]> {
    const notifications = await this.prisma.actionNotification.findMany({
      where: { actionId },
      orderBy: { sentAt: 'desc' },
    });

    return notifications.map((n) => this.mapToDomain(n));
  }

  async findByUserId(userId: string): Promise<ActionNotification[]> {
    const notifications = await this.prisma.actionNotification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
    });

    return notifications.map((n) => this.mapToDomain(n));
  }

  async findByUserIdWithTitle(
    userId: string,
    limit = 20,
  ): Promise<NotificationWithTitle[]> {
    const rows = await this.prisma.actionNotification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      include: {
        action: { select: { id: true, title: true } },
      },
    });

    return rows.map((n) => ({
      id: n.id,
      actionId: n.actionId,
      actionTitle: n.action?.title ?? '',
      userId: n.userId,
      notificationType: this.mapNotificationTypeToDomain(n.notificationType),
      sentAt: n.sentAt,
      smsSent: n.smsSent,
      whatsappSent: n.whatsappSent,
      lateStatus: n.lateStatus,
    }));
  }

  private mapToDomain(
    prismaNotification: PrismaActionNotification,
  ): ActionNotification {
    return new ActionNotification(
      prismaNotification.id,
      prismaNotification.actionId,
      prismaNotification.userId,
      this.mapNotificationTypeToDomain(prismaNotification.notificationType),
      prismaNotification.sentAt,
      prismaNotification.smsSent,
      prismaNotification.whatsappSent,
      prismaNotification.lateStatus,
      prismaNotification.createdAt,
    );
  }
}
