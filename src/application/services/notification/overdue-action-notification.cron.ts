import { ActionStatus } from '@/core/domain/shared/enums';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { SendOverdueActionNotificationService } from './send-overdue-action-notification.service';

/** Todo dia às 9h (horário do servidor). */
const OVERDUE_NOTIFICATION_CRON = '0 9 * * *';

@Injectable()
export class OverdueActionNotificationCron {
  private readonly logger = new Logger(OverdueActionNotificationCron.name);

  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly sendOverdueActionNotificationService: SendOverdueActionNotificationService,
  ) {}

  @Cron(OVERDUE_NOTIFICATION_CRON, {
    name: 'overdue-action-notification',
    timeZone: 'America/Sao_Paulo',
  })
  async handleOverdueActionNotification(): Promise<void> {
    this.logger.log('Iniciando job de notificação de ações atrasadas (9h).');

    const now = new Date();
    let totalSent = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    try {
      const companies = await this.companyRepository.findAll();

      for (const company of companies) {
        const actions = await this.actionRepository.findByCompanyId(
          company.id,
          {
            isLate: true,
            status: [ActionStatus.TODO, ActionStatus.IN_PROGRESS],
            includeDeleted: false,
          },
        );

        for (const action of actions) {
          try {
            const user = await this.userRepository.findById(
              action.responsibleId,
            );
            if (!user?.phone) {
              totalSkipped += 1;
              continue;
            }

            const result =
              await this.sendOverdueActionNotificationService.execute(
                user.phone,
                {
                  taskTitle: action.title,
                  status: action.status,
                  lateStatus: action.calculateLateStatus(now),
                  estimatedStartDate: action.estimatedStartDate,
                  estimatedEndDate: action.estimatedEndDate,
                },
              );

            if (result.smsSent || result.whatsappSent) {
              totalSent += 1;
            } else {
              totalSkipped += 1;
            }
          } catch (err) {
            totalErrors += 1;
            this.logger.warn(
              `Erro ao notificar ação atrasada ${action.id}: ${err instanceof Error ? err.message : err}`,
            );
          }
        }
      }

      this.logger.log(
        `Job de ações atrasadas finalizado: ${totalSent} notificações enviadas, ${totalSkipped} ignoradas, ${totalErrors} erros.`,
      );
    } catch (err) {
      this.logger.error(
        `Falha no job de ações atrasadas: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
