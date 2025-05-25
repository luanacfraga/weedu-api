"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductivityMetricsService = void 0;
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const productivity_metrics_dto_1 = require("../dto/productivity-metrics.dto");
let ProductivityMetricsService = class ProductivityMetricsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProductivityMetrics(userId, companyId, dto) {
        const { periodType, startDate, endDate } = dto;
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
        const actionsByResponsible = {};
        teamActions.forEach(action => {
            if (!actionsByResponsible[action.responsibleId]) {
                actionsByResponsible[action.responsibleId] = [];
            }
            actionsByResponsible[action.responsibleId].push(action);
        });
        const completedByPeriod = this.calculateCompletedByPeriod(actions, periodType);
        const averageCompletionTime = this.calculateAverageCompletionTime(actions);
        const onTimeCompletionRate = this.calculateOnTimeCompletionRate(actions);
        const onTimeVsLate = this.calculateOnTimeVsLate(actions);
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
        function compare(val, avg) {
            if (val > avg)
                return 'acima';
            if (val < avg)
                return 'abaixo';
            return 'igual';
        }
        const comparison = {
            averageCompletionTime: compare(averageCompletionTime, teamAverage.averageCompletionTime),
            onTimeCompletionRate: compare(onTimeCompletionRate, teamAverage.onTimeCompletionRate),
        };
        const statusSummary = actions.reduce((acc, action) => {
            acc[action.status] = (acc[action.status] || 0) + 1;
            return acc;
        }, {});
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
    calculateCompletedByPeriod(actions, periodType) {
        const completedActions = actions.filter((action) => action.status === client_1.ActionStatus.DONE);
        const groupedByPeriod = new Map();
        const allPeriods = new Set();
        const startDate = new Date(Math.min(...completedActions.map(a => new Date(a.actualEndDate).getTime())));
        const endDate = new Date(Math.max(...completedActions.map(a => new Date(a.actualEndDate).getTime())));
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            let periodKey;
            switch (periodType) {
                case productivity_metrics_dto_1.PeriodType.DAILY:
                    periodKey = currentDate.toISOString().split('T')[0];
                    break;
                case productivity_metrics_dto_1.PeriodType.WEEKLY:
                    const weekNumber = this.getWeekNumber(currentDate);
                    periodKey = `${currentDate.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
                    break;
                case productivity_metrics_dto_1.PeriodType.MONTHLY:
                    periodKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    break;
            }
            allPeriods.add(periodKey);
            switch (periodType) {
                case productivity_metrics_dto_1.PeriodType.DAILY:
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case productivity_metrics_dto_1.PeriodType.WEEKLY:
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case productivity_metrics_dto_1.PeriodType.MONTHLY:
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
            }
        }
        allPeriods.forEach(period => {
            groupedByPeriod.set(period, 0);
        });
        completedActions.forEach((action) => {
            const date = new Date(action.actualEndDate);
            let periodKey;
            switch (periodType) {
                case productivity_metrics_dto_1.PeriodType.DAILY:
                    periodKey = date.toISOString().split('T')[0];
                    break;
                case productivity_metrics_dto_1.PeriodType.WEEKLY:
                    const weekNumber = this.getWeekNumber(date);
                    periodKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
                    break;
                case productivity_metrics_dto_1.PeriodType.MONTHLY:
                    periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    break;
            }
            groupedByPeriod.set(periodKey, (groupedByPeriod.get(periodKey) || 0) + 1);
        });
        const result = Object.fromEntries(groupedByPeriod);
        return Object.keys(result)
            .sort()
            .reduce((obj, key) => {
            obj[key] = result[key];
            return obj;
        }, {});
    }
    calculateAverageCompletionTime(actions) {
        const completedActions = actions.filter((action) => action.status === client_1.ActionStatus.DONE &&
            action.actualStartDate &&
            action.actualEndDate);
        if (completedActions.length === 0)
            return 0;
        const totalTime = completedActions.reduce((acc, action) => {
            const start = new Date(action.actualStartDate);
            const end = new Date(action.actualEndDate);
            return acc + (end.getTime() - start.getTime());
        }, 0);
        return totalTime / completedActions.length;
    }
    calculateOnTimeCompletionRate(actions) {
        const completedActions = actions.filter((action) => action.status === client_1.ActionStatus.DONE &&
            action.actualEndDate &&
            action.estimatedEndDate);
        if (completedActions.length === 0)
            return 0;
        const onTimeActions = completedActions.filter((action) => new Date(action.actualEndDate) <= new Date(action.estimatedEndDate));
        return (onTimeActions.length / completedActions.length) * 100;
    }
    calculateOnTimeVsLate(actions) {
        const completedActions = actions.filter((action) => action.status === client_1.ActionStatus.DONE);
        const onTime = completedActions.filter((action) => !action.isLate).length;
        const late = completedActions.filter((action) => action.isLate).length;
        return {
            onTime,
            late,
            total: completedActions.length,
        };
    }
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    isActionLate(action) {
        return action.status !== client_1.ActionStatus.DONE && new Date() >= new Date(action.estimatedEndDate);
    }
    async getTeamMetrics(managerId, companyId, dto) {
        const { periodType, startDate, endDate } = dto;
        const teamMembers = await this.prisma.user.findMany({
            where: { managerId },
            select: { id: true, name: true },
        });
        const responsibleIds = teamMembers.map(u => u.id);
        if (responsibleIds.length === 0) {
            return { team: [], teamTotal: null };
        }
        const actions = await this.prisma.action.findMany({
            where: {
                companyId,
                responsibleId: { in: responsibleIds },
                OR: [
                    {
                        status: client_1.ActionStatus.DONE,
                        actualEndDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    {
                        status: client_1.ActionStatus.IN_PROGRESS,
                        actualStartDate: {
                            lte: endDate,
                        },
                        actualEndDate: null,
                    },
                    {
                        status: client_1.ActionStatus.TODO,
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
        const actionsByResponsible = {};
        actions.forEach(action => {
            if (!actionsByResponsible[action.responsibleId]) {
                actionsByResponsible[action.responsibleId] = [];
            }
            actionsByResponsible[action.responsibleId].push(action);
        });
        const team = teamMembers.map(member => {
            const memberActions = actionsByResponsible[member.id] || [];
            const inProgress = memberActions.filter(a => a.status === client_1.ActionStatus.IN_PROGRESS &&
                a.actualStartDate <= new Date(endDate) &&
                !a.actualEndDate).length;
            const completed = memberActions.filter(a => a.status === client_1.ActionStatus.DONE &&
                a.actualEndDate >= new Date(startDate) &&
                a.actualEndDate <= new Date(endDate)).length;
            const pending = memberActions.filter(a => a.status === client_1.ActionStatus.TODO &&
                a.actualStartDate <= new Date(endDate) &&
                !a.actualEndDate).length;
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
        const teamTotal = {
            total: actions.length,
            inProgress: actions.filter(a => a.status === client_1.ActionStatus.IN_PROGRESS &&
                a.actualStartDate <= new Date(endDate) &&
                !a.actualEndDate).length,
            completed: actions.filter(a => a.status === client_1.ActionStatus.DONE &&
                a.actualEndDate >= new Date(startDate) &&
                a.actualEndDate <= new Date(endDate)).length,
            pending: actions.filter(a => a.status === client_1.ActionStatus.TODO &&
                a.actualStartDate <= new Date(endDate) &&
                !a.actualEndDate).length,
            late: actions.filter(a => this.isActionLate(a)).length
        };
        return { team, teamTotal };
    }
};
exports.ProductivityMetricsService = ProductivityMetricsService;
exports.ProductivityMetricsService = ProductivityMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductivityMetricsService);
//# sourceMappingURL=productivity-metrics.service.js.map