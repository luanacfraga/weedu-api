import { ActionLateStatus, ActionStatus } from '@/core/domain/shared/enums';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

export type ManagerDashboardActionItem = {
  id: string;
  title: string;
  reason: 'BLOCKED' | 'LATE';
  lateStatus: string | null;
  isBlocked: boolean;
  priority: string;
  estimatedEndDate: string | null;
};

export type ManagerDashboardAttentionExecutor = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  criticalCount: number;
  actions: ManagerDashboardActionItem[];
};

export type ManagerDashboardResponse = {
  companyId: string;
  managerId: string;
  teamTotals: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    late: number;
    blocked: number;
  };
  attentionItems: ManagerDashboardAttentionExecutor[];
};

@Injectable()
export class GetManagerDashboardService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: {
    companyId: string;
    managerId: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ManagerDashboardResponse> {
    const { companyId, managerId, dateFrom, dateTo } = input;

    const allManagedTeams = await this.teamRepository.findByManagerId(managerId);
    const teams = allManagedTeams.filter((t) => t.companyId === companyId);

    const allActionsNested = await Promise.all(
      teams.map((t) => this.actionRepository.findByTeamId(t.id)),
    );
    const baseActions = allActionsNested.flat().filter((a) => !a.isDeleted());

    let allActions = baseActions;
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      allActions = baseActions.filter(
        (a) => a.estimatedEndDate && a.estimatedEndDate >= from && a.estimatedEndDate <= to,
      );
    }

    const now = new Date();

    const teamTotals = {
      total: allActions.length,
      todo: allActions.filter((a) => a.status === ActionStatus.TODO).length,
      inProgress: allActions.filter(
        (a) => a.status === ActionStatus.IN_PROGRESS,
      ).length,
      done: allActions.filter((a) => a.status === ActionStatus.DONE).length,
      late: allActions.filter((a) => a.calculateLateStatus(now) !== null)
        .length,
      blocked: allActions.filter((a) => a.isBlocked).length,
    };

    const teamUsersNested = await Promise.all(
      teams.map((t) => this.teamUserRepository.findByTeamId(t.id)),
    );
    const teamUserIds = [
      ...new Set(teamUsersNested.flat().map((tu) => tu.userId)),
    ];

    const users = await Promise.all(
      teamUserIds.map((uid) => this.userRepository.findById(uid)),
    );
    const userMap = new Map(
      users.filter(Boolean).map((u) => [u!.id, u!]),
    );

    const attentionItems: ManagerDashboardAttentionExecutor[] = teamUserIds
      .map((userId) => {
        const user = userMap.get(userId);
        const userActions = allActions.filter(
          (a) => a.responsibleId === userId,
        );

        const criticalActions: ManagerDashboardActionItem[] = [];

        for (const action of userActions) {
          if (action.status === ActionStatus.DONE) continue;

          const lateStatus = action.calculateLateStatus(now);

          if (action.isBlocked) {
            criticalActions.push({
              id: action.id,
              title: action.title,
              reason: 'BLOCKED',
              lateStatus: lateStatus ?? null,
              isBlocked: true,
              priority: action.priority,
              estimatedEndDate:
                action.estimatedEndDate?.toISOString() ?? null,
            });
          } else if (
            lateStatus === ActionLateStatus.LATE_TO_START ||
            lateStatus === ActionLateStatus.LATE_TO_FINISH
          ) {
            criticalActions.push({
              id: action.id,
              title: action.title,
              reason: 'LATE',
              lateStatus,
              isBlocked: false,
              priority: action.priority,
              estimatedEndDate:
                action.estimatedEndDate?.toISOString() ?? null,
            });
          }
        }

        return {
          userId,
          name: user ? `${user.firstName} ${user.lastName}` : userId,
          avatarUrl: user?.profileImageUrl ?? null,
          avatarColor: user?.avatarColor ?? null,
          criticalCount: criticalActions.length,
          actions: criticalActions,
        };
      })
      .filter((e) => e.criticalCount > 0)
      .sort((a, b) => b.criticalCount - a.criticalCount);

    return { companyId, managerId, teamTotals, attentionItems };
  }
}
