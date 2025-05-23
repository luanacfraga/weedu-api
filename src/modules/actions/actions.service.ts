import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionStatus, KanbanColumn, UserRole } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@Injectable()
export class ActionsService {
  constructor(private prisma: PrismaService) {}

  async createAction(userId: string, userRole: UserRole, createActionDto: CreateActionDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: createActionDto.companyId },
      include: {
        users: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const hasPermission = company.users.some(
      (user) => user.id === userId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Você não tem permissão para criar ações nesta empresa',
      );
    }

    // Se for colaborador, só pode criar ações para si mesmo
    if (userRole === UserRole.COLLABORATOR && createActionDto.responsibleId !== userId) {
      throw new ForbiddenException(
        'Colaboradores só podem criar ações para si mesmos',
      );
    }

    // Se for manager, verifica se o responsável é da sua equipe
    if (userRole === UserRole.MANAGER) {
      const responsible = await this.prisma.user.findFirst({
        where: {
          id: createActionDto.responsibleId,
          managerId: userId,
        },
      });

      if (!responsible) {
        throw new ForbiddenException(
          'Managers só podem criar ações para membros da sua equipe',
        );
      }
    }

    // Verifica se o responsável existe e pertence à empresa
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
      throw new NotFoundException(
        'Responsável não encontrado ou não pertence à empresa',
      );
    }

    // Obtém a última posição na coluna TODO
    const lastPosition = await this.prisma.kanbanOrder.findFirst({
      where: {
        column: KanbanColumn.TODO,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const nextPosition = (lastPosition?.position || 0) + 1;

    // Cria a ação com o checklist e kanbanOrder
    return this.prisma.action.create({
      data: {
        title: createActionDto.title,
        description: createActionDto.description,
        companyId: createActionDto.companyId,
        creatorId: userId,
        responsibleId: createActionDto.responsibleId,
        status: createActionDto.status || ActionStatus.TODO,
        estimatedStartDate: createActionDto.estimatedStartDate,
        estimatedEndDate: createActionDto.estimatedEndDate,
        priority: createActionDto.priority,
        kanbanOrder: {
          create: {
            column: KanbanColumn.TODO,
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

  async moveAction(userId: string, userRole: UserRole, actionId: string, toColumn: KanbanColumn, newPosition: number) {
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
      throw new NotFoundException('Ação não encontrada');
    }

    // Verifica permissões baseadas no papel
    if (userRole === UserRole.COLLABORATOR && action.responsibleId !== userId) {
      throw new ForbiddenException('Você só pode mover suas próprias ações');
    }

    if (userRole === UserRole.MANAGER) {
      const isTeamMember = await this.prisma.user.findFirst({
        where: {
          id: action.responsibleId,
          managerId: userId,
        },
      });

      if (!isTeamMember && action.responsibleId !== userId) {
        throw new ForbiddenException('Você só pode mover ações da sua equipe');
      }
    }

    // Registra o movimento
    await this.prisma.actionMovement.create({
      data: {
        actionId,
        fromColumn: action.kanbanOrder.column,
        toColumn,
        movedById: userId,
        timeSpent: action.actualStartDate ? Math.floor((Date.now() - action.actualStartDate.getTime()) / 1000) : null,
      },
    });

    // Atualiza a posição de todas as ações na coluna de destino
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

    // Mapeia KanbanColumn para ActionStatus
    const columnToStatusMap = {
      [KanbanColumn.TODO]: ActionStatus.TODO,
      [KanbanColumn.IN_PROGRESS]: ActionStatus.IN_PROGRESS,
      [KanbanColumn.DONE]: ActionStatus.DONE,
    };

    // Atualiza a ação
    return this.prisma.action.update({
      where: { id: actionId },
      data: {
        status: columnToStatusMap[toColumn],
        actualStartDate: toColumn === KanbanColumn.IN_PROGRESS ? new Date() : action.actualStartDate,
        actualEndDate: toColumn === KanbanColumn.DONE ? new Date() : action.actualEndDate,
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

  async findAll(userId: string, userRole: UserRole, companyId: string, responsibleId?: string, status?: string) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    // Se for colaborador, só pode ver suas próprias ações
    if (userRole === UserRole.COLLABORATOR) {
      where.responsibleId = userId;
    }
    // Se for manager, só pode ver ações da sua equipe
    else if (userRole === UserRole.MANAGER) {
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

  async findOne(userId: string, userRole: UserRole, id: string) {
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
      throw new NotFoundException('Ação não encontrada');
    }

    // Verifica permissões baseadas no papel
    if (userRole === UserRole.COLLABORATOR && action.responsibleId !== userId) {
      throw new ForbiddenException('Você só pode visualizar suas próprias ações');
    }

    if (userRole === UserRole.MANAGER) {
      const isTeamMember = await this.prisma.user.findFirst({
        where: {
          id: action.responsibleId,
          managerId: userId,
        },
      });

      if (!isTeamMember && action.responsibleId !== userId) {
        throw new ForbiddenException('Você só pode visualizar ações da sua equipe');
      }
    }

    return action;
  }

  async update(userId: string, userRole: UserRole, id: string, updateActionDto: UpdateActionDto) {
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
      throw new NotFoundException('Ação não encontrada');
    }

    // Verifica permissões baseadas no papel
    if (userRole === UserRole.COLLABORATOR && action.responsibleId !== userId) {
      throw new ForbiddenException('Você só pode atualizar suas próprias ações');
    }

    if (userRole === UserRole.MANAGER) {
      const isTeamMember = await this.prisma.user.findFirst({
        where: {
          id: action.responsibleId,
          managerId: userId,
        },
      });

      if (!isTeamMember && action.responsibleId !== userId) {
        throw new ForbiddenException('Você só pode atualizar ações da sua equipe');
      }
    }

    // Se houver mudança de responsável, verifica permissões
    if (updateActionDto.responsibleId && updateActionDto.responsibleId !== action.responsibleId) {
      if (userRole === UserRole.COLLABORATOR) {
        throw new ForbiddenException('Colaboradores não podem transferir ações');
      }

      if (userRole === UserRole.MANAGER) {
        const isTeamMember = await this.prisma.user.findFirst({
          where: {
            id: updateActionDto.responsibleId,
            managerId: userId,
          },
        });

        if (!isTeamMember) {
          throw new ForbiddenException('Managers só podem transferir ações para membros da sua equipe');
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

  async remove(userId: string, id: string) {
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
      throw new NotFoundException('Ação não encontrada');
    }

    const hasPermission = action.company.users.some(
      (user) => user.id === userId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Você não tem permissão para remover esta ação',
      );
    }

    // Remove a ação e todos os registros relacionados
    await this.prisma.action.delete({
      where: { id },
    });

    return { message: 'Ação removida com sucesso' };
  }
} 