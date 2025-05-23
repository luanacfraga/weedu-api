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
exports.ActionsService = void 0;
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ActionsService = class ActionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAction(userId, userRole, createActionDto) {
        const company = await this.prisma.company.findUnique({
            where: { id: createActionDto.companyId },
            include: {
                users: true,
            },
        });
        if (!company) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        const hasPermission = company.users.some((user) => user.id === userId);
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Você não tem permissão para criar ações nesta empresa');
        }
        if (userRole === client_1.UserRole.COLLABORATOR && createActionDto.responsibleId !== userId) {
            throw new common_1.ForbiddenException('Colaboradores só podem criar ações para si mesmos');
        }
        if (userRole === client_1.UserRole.MANAGER) {
            const responsible = await this.prisma.user.findFirst({
                where: {
                    id: createActionDto.responsibleId,
                    managerId: userId,
                },
            });
            if (!responsible) {
                throw new common_1.ForbiddenException('Managers só podem criar ações para membros da sua equipe');
            }
        }
        const responsible = await this.prisma.user.findFirst({
            where: {
                id: createActionDto.responsibleId,
                companies: {
                    some: {
                        id: createActionDto.companyId,
                    },
                },
            },
        });
        if (!responsible) {
            throw new common_1.NotFoundException('Responsável não encontrado ou não pertence à empresa');
        }
        const lastPosition = await this.prisma.kanbanOrder.findFirst({
            where: {
                column: client_1.KanbanColumn.TODO,
            },
            orderBy: {
                position: 'desc',
            },
        });
        const nextPosition = (lastPosition?.position || 0) + 1;
        return this.prisma.action.create({
            data: {
                title: createActionDto.title,
                description: createActionDto.description,
                companyId: createActionDto.companyId,
                creatorId: userId,
                responsibleId: createActionDto.responsibleId,
                status: createActionDto.status || client_1.ActionStatus.TODO,
                estimatedStartDate: createActionDto.estimatedStartDate,
                estimatedEndDate: createActionDto.estimatedEndDate,
                priority: createActionDto.priority,
                kanbanOrder: {
                    create: {
                        column: client_1.KanbanColumn.TODO,
                        position: nextPosition,
                        sortOrder: nextPosition,
                    },
                },
                checklistItems: {
                    create: createActionDto.checklistItems?.map((item, index) => ({
                        description: item.description,
                        order: index,
                    })) || [],
                },
            },
            include: {
                company: true,
                creator: true,
                responsible: true,
                kanbanOrder: true,
                checklistItems: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
    }
    async moveAction(userId, userRole, actionId, toColumn, newPosition) {
        const action = await this.prisma.action.findUnique({
            where: { id: actionId },
            include: {
                company: {
                    include: {
                        users: true,
                    },
                },
                kanbanOrder: true,
                responsible: true,
            },
        });
        if (!action) {
            throw new common_1.NotFoundException('Ação não encontrada');
        }
        if (userRole === client_1.UserRole.COLLABORATOR && action.responsibleId !== userId) {
            throw new common_1.ForbiddenException('Você só pode mover suas próprias ações');
        }
        if (userRole === client_1.UserRole.MANAGER) {
            const isTeamMember = await this.prisma.user.findFirst({
                where: {
                    id: action.responsibleId,
                    managerId: userId,
                },
            });
            if (!isTeamMember && action.responsibleId !== userId) {
                throw new common_1.ForbiddenException('Você só pode mover ações da sua equipe');
            }
        }
        await this.prisma.actionMovement.create({
            data: {
                actionId,
                fromColumn: action.kanbanOrder.column,
                toColumn,
                movedById: userId,
                timeSpent: action.actualStartDate ? Math.floor((Date.now() - action.actualStartDate.getTime()) / 1000) : null,
            },
        });
        await this.prisma.kanbanOrder.updateMany({
            where: {
                column: toColumn,
                position: {
                    gte: newPosition,
                },
            },
            data: {
                position: {
                    increment: 1,
                },
                sortOrder: {
                    increment: 1,
                },
            },
        });
        const columnToStatusMap = {
            [client_1.KanbanColumn.TODO]: client_1.ActionStatus.TODO,
            [client_1.KanbanColumn.IN_PROGRESS]: client_1.ActionStatus.IN_PROGRESS,
            [client_1.KanbanColumn.DONE]: client_1.ActionStatus.DONE,
        };
        return this.prisma.action.update({
            where: { id: actionId },
            data: {
                status: columnToStatusMap[toColumn],
                actualStartDate: toColumn === client_1.KanbanColumn.IN_PROGRESS ? new Date() : action.actualStartDate,
                actualEndDate: toColumn === client_1.KanbanColumn.DONE ? new Date() : action.actualEndDate,
                kanbanOrder: {
                    update: {
                        column: toColumn,
                        position: newPosition,
                        sortOrder: newPosition,
                        lastMovedAt: new Date(),
                    },
                },
            },
            include: {
                company: true,
                creator: true,
                responsible: true,
                kanbanOrder: true,
                checklistItems: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
    }
    async findAll(userId, userRole, companyId, responsibleId, status) {
        const where = {
            companyId,
            deletedAt: null,
        };
        if (userRole === client_1.UserRole.COLLABORATOR) {
            where.responsibleId = userId;
        }
        else if (userRole === client_1.UserRole.MANAGER) {
            const teamMembers = await this.prisma.user.findMany({
                where: { managerId: userId },
                select: { id: true },
            });
            where.responsibleId = {
                in: [userId, ...teamMembers.map(member => member.id)],
            };
        }
        if (responsibleId) {
            where.responsibleId = responsibleId;
        }
        if (status) {
            where.status = status;
        }
        return this.prisma.action.findMany({
            where,
            include: {
                company: true,
                creator: true,
                responsible: true,
                kanbanOrder: true,
                checklistItems: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(userId, userRole, id) {
        const action = await this.prisma.action.findUnique({
            where: { id },
            include: {
                company: {
                    include: {
                        users: true,
                    },
                },
                creator: true,
                responsible: true,
                kanbanOrder: true,
                checklistItems: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
        if (!action) {
            throw new common_1.NotFoundException('Ação não encontrada');
        }
        if (userRole === client_1.UserRole.COLLABORATOR && action.responsibleId !== userId) {
            throw new common_1.ForbiddenException('Você só pode visualizar suas próprias ações');
        }
        if (userRole === client_1.UserRole.MANAGER) {
            const isTeamMember = await this.prisma.user.findFirst({
                where: {
                    id: action.responsibleId,
                    managerId: userId,
                },
            });
            if (!isTeamMember && action.responsibleId !== userId) {
                throw new common_1.ForbiddenException('Você só pode visualizar ações da sua equipe');
            }
        }
        return action;
    }
    async update(userId, userRole, id, updateActionDto) {
        const action = await this.prisma.action.findUnique({
            where: { id },
            include: {
                company: {
                    include: {
                        users: true,
                    },
                },
                responsible: true,
            },
        });
        if (!action) {
            throw new common_1.NotFoundException('Ação não encontrada');
        }
        if (userRole === client_1.UserRole.COLLABORATOR && action.responsibleId !== userId) {
            throw new common_1.ForbiddenException('Você só pode atualizar suas próprias ações');
        }
        if (userRole === client_1.UserRole.MANAGER) {
            const isTeamMember = await this.prisma.user.findFirst({
                where: {
                    id: action.responsibleId,
                    managerId: userId,
                },
            });
            if (!isTeamMember && action.responsibleId !== userId) {
                throw new common_1.ForbiddenException('Você só pode atualizar ações da sua equipe');
            }
        }
        if (updateActionDto.responsibleId && updateActionDto.responsibleId !== action.responsibleId) {
            if (userRole === client_1.UserRole.COLLABORATOR) {
                throw new common_1.ForbiddenException('Colaboradores não podem transferir ações');
            }
            if (userRole === client_1.UserRole.MANAGER) {
                const isTeamMember = await this.prisma.user.findFirst({
                    where: {
                        id: updateActionDto.responsibleId,
                        managerId: userId,
                    },
                });
                if (!isTeamMember) {
                    throw new common_1.ForbiddenException('Managers só podem transferir ações para membros da sua equipe');
                }
            }
        }
        return this.prisma.action.update({
            where: { id },
            data: {
                ...updateActionDto,
                checklistItems: updateActionDto.checklistItems
                    ? {
                        deleteMany: {},
                        create: updateActionDto.checklistItems.map((item, index) => ({
                            description: item.description,
                            order: index,
                        })),
                    }
                    : undefined,
            },
            include: {
                company: true,
                creator: true,
                responsible: true,
                kanbanOrder: true,
                checklistItems: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
    }
    async remove(userId, id) {
        const action = await this.prisma.action.findUnique({
            where: { id },
            include: {
                company: {
                    include: {
                        users: true,
                    },
                },
            },
        });
        if (!action) {
            throw new common_1.NotFoundException('Ação não encontrada');
        }
        const hasPermission = action.company.users.some((user) => user.id === userId);
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Você não tem permissão para remover esta ação');
        }
        await this.prisma.action.delete({
            where: { id },
        });
        return { message: 'Ação removida com sucesso' };
    }
};
exports.ActionsService = ActionsService;
exports.ActionsService = ActionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActionsService);
//# sourceMappingURL=actions.service.js.map