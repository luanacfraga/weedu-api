import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { ActionStatus } from '@prisma/client';
import { PeriodType, ProductivityMetricsDto } from '../dto/productivity-metrics.dto';

@Injectable()
export class ProductivityMetricsService {
  constructor(private prisma: PrismaService) {}

  async getProductivityMetrics(
    userId: string,
    companyId: string,
    dto: ProductivityMetricsDto,
  ) {
    const { periodType, startDate, endDate } = dto;

    // Busca todas as ações do usuário no período
    const actions = await this.prisma.action.findMany({
      where: {
        responsibleId: userId,
        companyId,
        actualEndDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        actualStartDate: true,
        actualEndDate: true,
        estimatedEndDate: true,
        isLate: true,
        status: true,
        responsibleId: true,
      },
    });

    // Busca todas as ações da equipe no período
    const teamActions = await this.prisma.action.findMany({
      where: {
        companyId,
        actualEndDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        actualStartDate: true,
        actualEndDate: true,
        estimatedEndDate: true,
        isLate: true,
        status: true,
        responsibleId: true,
      },
    });

    // Agrupa ações da equipe por responsável
    const actionsByResponsible: Record<string, any[]> = {};
    teamActions.forEach(action => {
      if (!actionsByResponsible[action.responsibleId]) {
        actionsByResponsible[action.responsibleId] = [];
      }
      actionsByResponsible[action.responsibleId].push(action);
    });

    // Calcula métricas pessoais
    const completedByPeriod = this.calculateCompletedByPeriod(actions, periodType);
    const averageCompletionTime = this.calculateAverageCompletionTime(actions);
    const onTimeCompletionRate = this.calculateOnTimeCompletionRate(actions);
    const onTimeVsLate = this.calculateOnTimeVsLate(actions);

    // Calcula médias da equipe
    const teamMetrics = Object.values(actionsByResponsible)
      .filter(arr => arr.length > 0)
      .map(arr => ({
        averageCompletionTime: this.calculateAverageCompletionTime(arr),
        onTimeCompletionRate: this.calculateOnTimeCompletionRate(arr),
        onTimeVsLate: this.calculateOnTimeVsLate(arr),
      }));

    const teamAverage = {
      averageCompletionTime: teamMetrics.length > 0 ? teamMetrics.reduce((acc, m) => acc + m.averageCompletionTime, 0) / teamMetrics.length : 0,
      onTimeCompletionRate: teamMetrics.length > 0 ? teamMetrics.reduce((acc, m) => acc + m.onTimeCompletionRate, 0) / teamMetrics.length : 0,
      onTimeVsLate: {
        onTime: teamMetrics.length > 0 ? Math.round(teamMetrics.reduce((acc, m) => acc + m.onTimeVsLate.onTime, 0) / teamMetrics.length) : 0,
        late: teamMetrics.length > 0 ? Math.round(teamMetrics.reduce((acc, m) => acc + m.onTimeVsLate.late, 0) / teamMetrics.length) : 0,
        total: teamMetrics.length > 0 ? Math.round(teamMetrics.reduce((acc, m) => acc + m.onTimeVsLate.total, 0) / teamMetrics.length) : 0,
      },
    };

    // Comparação
    function compare(val: number, avg: number) {
      if (val > avg) return 'acima';
      if (val < avg) return 'abaixo';
      return 'igual';
    }

    const comparison = {
      averageCompletionTime: compare(averageCompletionTime, teamAverage.averageCompletionTime),
      onTimeCompletionRate: compare(onTimeCompletionRate, teamAverage.onTimeCompletionRate),
    };

    // Resumo de status das ações pessoais
    const statusSummary = actions.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Quantidade de ações atrasadas
    const lateCount = actions.filter(action => action.isLate).length;

    return {
      personal: {
        completedByPeriod,
        averageCompletionTime,
        onTimeCompletionRate,
        onTimeVsLate,
      },
      teamAverage,
      comparison,
      statusSummary,
      lateCount,
    };
  }

  private calculateCompletedByPeriod(actions: any[], periodType: PeriodType) {
    const completedActions = actions.filter(
      (action) => action.status === ActionStatus.DONE,
    );

    const groupedByPeriod = new Map<string, number>();
    const allPeriods = new Set<string>();

    // Gera todos os períodos possíveis entre startDate e endDate
    const startDate = new Date(Math.min(...completedActions.map(a => new Date(a.actualEndDate).getTime())));
    const endDate = new Date(Math.max(...completedActions.map(a => new Date(a.actualEndDate).getTime())));

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      let periodKey: string;
      switch (periodType) {
        case PeriodType.DAILY:
          periodKey = currentDate.toISOString().split('T')[0];
          break;
        case PeriodType.WEEKLY:
          const weekNumber = this.getWeekNumber(currentDate);
          periodKey = `${currentDate.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
          break;
        case PeriodType.MONTHLY:
          periodKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
      }
      allPeriods.add(periodKey);
      
      // Avança para o próximo período
      switch (periodType) {
        case PeriodType.DAILY:
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case PeriodType.WEEKLY:
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case PeriodType.MONTHLY:
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    // Inicializa todos os períodos com 0
    allPeriods.forEach(period => {
      groupedByPeriod.set(period, 0);
    });

    // Conta as ações completadas
    completedActions.forEach((action) => {
      const date = new Date(action.actualEndDate);
      let periodKey: string;

      switch (periodType) {
        case PeriodType.DAILY:
          periodKey = date.toISOString().split('T')[0];
          break;
        case PeriodType.WEEKLY:
          const weekNumber = this.getWeekNumber(date);
          periodKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
          break;
        case PeriodType.MONTHLY:
          periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
      }

      groupedByPeriod.set(
        periodKey,
        (groupedByPeriod.get(periodKey) || 0) + 1,
      );
    });

    // Converte para objeto e ordena por data
    const result = Object.fromEntries(groupedByPeriod);
    return Object.keys(result)
      .sort()
      .reduce((obj, key) => {
        obj[key] = result[key];
        return obj;
      }, {});
  }

  private calculateAverageCompletionTime(actions: any[]) {
    const completedActions = actions.filter(
      (action) =>
        action.status === ActionStatus.DONE &&
        action.actualStartDate &&
        action.actualEndDate,
    );

    if (completedActions.length === 0) return 0;

    const totalTime = completedActions.reduce((acc, action) => {
      const start = new Date(action.actualStartDate);
      const end = new Date(action.actualEndDate);
      return acc + (end.getTime() - start.getTime());
    }, 0);

    return totalTime / completedActions.length; // Retorna em milissegundos
  }

  private calculateOnTimeCompletionRate(actions: any[]) {
    const completedActions = actions.filter(
      (action) =>
        action.status === ActionStatus.DONE &&
        action.actualEndDate &&
        action.estimatedEndDate,
    );

    if (completedActions.length === 0) return 0;

    const onTimeActions = completedActions.filter(
      (action) =>
        new Date(action.actualEndDate) <= new Date(action.estimatedEndDate),
    );

    return (onTimeActions.length / completedActions.length) * 100;
  }

  private calculateOnTimeVsLate(actions: any[]) {
    const completedActions = actions.filter(
      (action) => action.status === ActionStatus.DONE,
    );

    const onTime = completedActions.filter((action) => !action.isLate).length;
    const late = completedActions.filter((action) => action.isLate).length;

    return {
      onTime,
      late,
      total: completedActions.length,
    };
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private isActionLate(action: any): boolean {
    return action.status !== ActionStatus.DONE && new Date() >= new Date(action.estimatedEndDate);
  }

  async getTeamMetrics(managerId: string, companyId: string, dto: ProductivityMetricsDto) {
    const { periodType, startDate, endDate } = dto;
    
    // Busca todos os colaboradores do gestor
    const teamMembers = await this.prisma.user.findMany({
      where: { managerId },
      select: { id: true, name: true },
    });
    const responsibleIds = teamMembers.map(u => u.id);
    if (responsibleIds.length === 0) {
      return { team: [], teamTotal: null };
    }

    // Busca todas as ações do time no período
    const actions = await this.prisma.action.findMany({
      where: {
        companyId,
        responsibleId: { in: responsibleIds },
        OR: [
          // Ações concluídas no período
          {
            status: ActionStatus.DONE,
            actualEndDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          // Ações em andamento que começaram antes ou durante o período
          {
            status: ActionStatus.IN_PROGRESS,
            actualStartDate: {
              lte: endDate,
            },
            actualEndDate: null,
          },
          // Ações pendentes (TODO) que foram criadas antes ou durante o período
          {
            status: ActionStatus.TODO,
            actualStartDate: {
              lte: endDate,
            },
            actualEndDate: null,
          },
        ],
      },
      select: {
        id: true,
        actualStartDate: true,
        actualEndDate: true,
        estimatedEndDate: true,
        status: true,
        responsibleId: true,
      },
      orderBy: {
        actualStartDate: 'desc',
      },
    });

    // Agrupa ações por responsável
    const actionsByResponsible: Record<string, any[]> = {};
    actions.forEach(action => {
      if (!actionsByResponsible[action.responsibleId]) {
        actionsByResponsible[action.responsibleId] = [];
      }
      actionsByResponsible[action.responsibleId].push(action);
    });

    // Calcula métricas individuais
    const team = teamMembers.map(member => {
      const memberActions = actionsByResponsible[member.id] || [];
      
      // Filtra ações por status
      const inProgress = memberActions.filter(a => 
        a.status === ActionStatus.IN_PROGRESS && 
        a.actualStartDate <= new Date(endDate) && 
        !a.actualEndDate
      ).length;

      const completed = memberActions.filter(a => 
        a.status === ActionStatus.DONE && 
        a.actualEndDate >= new Date(startDate) && 
        a.actualEndDate <= new Date(endDate)
      ).length;

      const pending = memberActions.filter(a => 
        a.status === ActionStatus.TODO && 
        a.actualStartDate <= new Date(endDate) && 
        !a.actualEndDate
      ).length;

      const late = memberActions.filter(a => this.isActionLate(a)).length;
      const totalActions = memberActions.length;

      return {
        id: member.id,
        name: member.name,
        metrics: {
          total: totalActions,
          inProgress,
          completed,
          pending,
          late
        }
      };
    });

    // Calcula totais do time
    const teamTotal = {
      total: actions.length,
      inProgress: actions.filter(a => 
        a.status === ActionStatus.IN_PROGRESS && 
        a.actualStartDate <= new Date(endDate) && 
        !a.actualEndDate
      ).length,
      completed: actions.filter(a => 
        a.status === ActionStatus.DONE && 
        a.actualEndDate >= new Date(startDate) && 
        a.actualEndDate <= new Date(endDate)
      ).length,
      pending: actions.filter(a => 
        a.status === ActionStatus.TODO && 
        a.actualStartDate <= new Date(endDate) && 
        !a.actualEndDate
      ).length,
      late: actions.filter(a => this.isActionLate(a)).length
    };

    return { team, teamTotal };
  }
} 