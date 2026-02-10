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
    this.logger.log('🔔 Iniciando job de notificação de ações atrasadas');

    const now = new Date();
    let totalSent = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    try {
      const companies = await this.companyRepository.findAll();
      this.logger.log(
        `📊 Encontradas ${companies.length} empresas para processar`,
      );

      for (const company of companies) {
        // Busca todas as ações TODO/IN_PROGRESS e filtra em memória as que estão atrasadas
        const allActions = await this.actionRepository.findByCompanyId(
          company.id,
          {
            status: [ActionStatus.TODO, ActionStatus.IN_PROGRESS],
            includeDeleted: false,
          },
        );

        // Filtra apenas ações que estão realmente atrasadas (calculado dinamicamente)
        const overdueActions = allActions.filter((action) =>
          action.calculateIsLate(now),
        );

        this.logger.log(
          `🏢 Empresa ${company.name} (${company.id}): ${allActions.length} ações TODO/IN_PROGRESS, ${overdueActions.length} atrasadas`,
        );

        for (const action of overdueActions) {
          this.logger.debug(
            `⏰ Processando ação atrasada: ${action.title} (${action.id})`,
          );
          try {
            const user = await this.userRepository.findById(
              action.responsibleId,
            );
            if (!user?.phone) {
              this.logger.debug(
                `⏭️  Ação ${action.id} ignorada: usuário sem telefone`,
              );
              totalSkipped += 1;
              continue;
            }

            const result =
              await this.sendOverdueActionNotificationService.execute(
                action.id,
                action.responsibleId,
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
              this.logger.log(
                `✅ Notificação enviada para ação ${action.id}: SMS=${result.smsSent}, WhatsApp=${result.whatsappSent}`,
              );
              totalSent += 1;
            } else {
              this.logger.debug(
                `⏭️  Notificação não enviada para ação ${action.id}`,
              );
              totalSkipped += 1;
            }
          } catch (err) {
            totalErrors += 1;
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.warn(
              `Erro ao notificar ação atrasada ${action.id}: ${msg}`,
            );
          }
        }
      }

      this.logger.log(
        `Job de ações atrasadas finalizado: ${totalSent} notificações enviadas, ${totalSkipped} ignoradas, ${totalErrors} erros.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Falha no job de ações atrasadas: ${msg}`);
    }
  }
}
