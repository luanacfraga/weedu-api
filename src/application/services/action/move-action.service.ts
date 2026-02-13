import { ActionMovement } from '@/core/domain/action/action-movement.entity';
import { Action } from '@/core/domain/action/action.entity';
import { ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { SendActionLifecycleNotificationService } from '@/application/services/notification/send-action-lifecycle-notification.service';
import { SendOverdueActionNotificationService } from '@/application/services/notification/send-overdue-action-notification.service';

export interface MoveActionInput {
  actionId: string;
  toStatus: ActionStatus;
  position?: number;
  movedById: string;
  notes?: string;
}

export interface MoveActionOutput {
  action: Action;
  movement: ActionMovement;
  kanbanOrder: {
    id: string;
    actionId: string;
    column: ActionStatus;
    position: number;
    sortOrder: number;
    lastMovedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class MoveActionService {
  private readonly logger = new Logger(MoveActionService.name);

  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('ActionMovementRepository')
    private readonly actionMovementRepository: ActionMovementRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('TransactionManager')
    private readonly transactionManager: TransactionManager,
    private readonly sendOverdueActionNotificationService: SendOverdueActionNotificationService,
    private readonly sendActionLifecycleNotificationService: SendActionLifecycleNotificationService,
  ) {}

  async execute(input: MoveActionInput): Promise<MoveActionOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    const currentKanbanOrder =
      await this.actionRepository.findKanbanOrderByActionId(input.actionId);

    const fromStatus = action.status;
    const toStatus = input.toStatus;

    let timeSpent: number | null = null;
    if (currentKanbanOrder) {
      const timeSpentMs = Date.now() - currentKanbanOrder.lastMovedAt.getTime();
      timeSpent = Math.floor(timeSpentMs / 1000);
    }

    const updatedAction = action.updateStatus(toStatus);

    const result = await this.transactionManager.execute(async (tx) => {
      let newPosition = input.position;
      if (newPosition === undefined) {
        const lastInColumn =
          await this.actionRepository.findLastKanbanOrderInColumn(toStatus, tx);
        newPosition = lastInColumn ? lastInColumn.position + 1 : 0;
      }

      const oldPosition = currentKanbanOrder?.position;
      if (fromStatus !== toStatus) {
        await this.handleCrossColumnMove(
          fromStatus,
          toStatus,
          oldPosition,
          newPosition,
          tx,
        );
      } else if (oldPosition !== undefined && oldPosition !== newPosition) {
        await this.handleSameColumnMove(
          fromStatus,
          oldPosition,
          newPosition,
          tx,
        );
      }

      const movement = new ActionMovement(
        randomUUID(),
        action.id,
        fromStatus,
        toStatus,
        input.movedById,
        new Date(),
        input.notes ?? null,
        timeSpent,
      );

      const [savedAction, savedMovement] = await Promise.all([
        this.actionRepository.updateWithKanbanOrder(
          action.id,
          {
            status: updatedAction.status,
            actualStartDate: updatedAction.actualStartDate,
            actualEndDate: updatedAction.actualEndDate,
            lateStatus: updatedAction.lateStatus,
          },
          {
            column: toStatus,
            position: newPosition,
          },
          tx,
        ),
        this.actionMovementRepository.create(movement, tx),
      ]);

      const kanbanOrder =
        await this.actionRepository.findFullKanbanOrderByActionId(
          action.id,
          tx,
        );

      if (!kanbanOrder) {
        throw new Error('KanbanOrder not found after update');
      }

      return {
        action: savedAction,
        movement: savedMovement,
        kanbanOrder,
      };
    });

    // Notifica responsável quando a ação passa a estar atrasada (SMS/WhatsApp)
    if (action.lateStatus === null && result.action.lateStatus !== null) {
      try {
        const [user, company] = await Promise.all([
          this.userRepository.findById(result.action.responsibleId),
          this.companyRepository.findById(result.action.companyId),
        ]);
        if (user?.phone) {
          await this.sendOverdueActionNotificationService.execute(
            result.action.id,
            result.action.responsibleId,
            user.phone,
            {
              taskTitle: result.action.title,
              status: result.action.status,
              lateStatus: result.action.lateStatus,
              estimatedStartDate: result.action.estimatedStartDate,
              estimatedEndDate: result.action.estimatedEndDate,
            },
            company?.notificationPreference,
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Falha ao enviar notificação de ação atrasada (ação ${result.action.id}): ${errorMessage}`,
        );
      }
    }

    // Notificação: ação iniciada (movida para IN_PROGRESS com actualStartDate)
    if (
      fromStatus === ActionStatus.TODO &&
      toStatus === ActionStatus.IN_PROGRESS &&
      result.action.actualStartDate
    ) {
      try {
        const [user, company] = await Promise.all([
          this.userRepository.findById(result.action.responsibleId),
          this.companyRepository.findById(result.action.companyId),
        ]);
        if (user?.phone) {
          await this.sendActionLifecycleNotificationService.sendActionStarted(
            result.action.id,
            result.action.responsibleId,
            user.phone,
            {
              taskTitle: result.action.title,
              startedDate: result.action.actualStartDate,
            },
            company?.notificationPreference,
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Falha ao enviar notificação de ação iniciada (ação ${result.action.id}): ${errorMessage}`,
        );
      }
    }

    // Notificação: ação concluída (movida para DONE com actualEndDate)
    if (
      toStatus === ActionStatus.DONE &&
      result.action.actualEndDate
    ) {
      try {
        const [user, company] = await Promise.all([
          this.userRepository.findById(result.action.responsibleId),
          this.companyRepository.findById(result.action.companyId),
        ]);
        if (user?.phone) {
          await this.sendActionLifecycleNotificationService.sendActionCompleted(
            result.action.id,
            result.action.responsibleId,
            user.phone,
            {
              taskTitle: result.action.title,
              completedDate: result.action.actualEndDate,
            },
            company?.notificationPreference,
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Falha ao enviar notificação de ação concluída (ação ${result.action.id}): ${errorMessage}`,
        );
      }
    }

    return result;
  }

  private async handleCrossColumnMove(
    fromStatus: ActionStatus,
    toStatus: ActionStatus,
    oldPosition: number | undefined,
    newPosition: number,
    tx: unknown,
  ): Promise<void> {
    await this.actionRepository.updateActionsPositionInColumn(
      toStatus,
      newPosition,
      1,
      tx,
    );

    if (oldPosition !== undefined) {
      await this.actionRepository.updateActionsPositionInColumn(
        fromStatus,
        oldPosition + 1,
        -1,
        tx,
      );
    }
  }

  private async handleSameColumnMove(
    column: ActionStatus,
    oldPosition: number,
    newPosition: number,
    tx: unknown,
  ): Promise<void> {
    if (newPosition < oldPosition) {
      await this.actionRepository.updateActionsPositionInRange(
        column,
        newPosition,
        oldPosition - 1,
        1,
        tx,
      );
    } else {
      await this.actionRepository.updateActionsPositionInRange(
        column,
        oldPosition + 1,
        newPosition,
        -1,
        tx,
      );
    }
  }
}
