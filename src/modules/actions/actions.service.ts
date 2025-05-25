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

    // Se for manager, verifica se o responsável é da sua equipe OU ele mesmo
    if (userRole === UserRole.MANAGER) {
      const responsible = await this.prisma.user.findFirst({
        where: {
          id: createActionDto.responsibleId,
          OR: [
            { managerId: userId },
            { id: userId },
          ],
        },
      });
      if (!responsible) {
        throw new ForbiddenException('Managers só podem criar ações para membros da sua equipe ou para si mesmos');
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
            isCompleted: item.checked || false,
          })) || [],
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        kanbanOrder: true,
        checklistItems: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    companyId: string,
    responsibleId?: string,
    status?: string,
    isBlocked?: boolean,
    isLate?: boolean,
    priority?: string,
    startDate?: Date,
    endDate?: Date,
    dateType?: 'estimated' | 'actual' | 'created',
    dateRange?: 'week' | 'month' | 'custom',
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
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
        'Você não tem permissão para visualizar ações desta empresa',
      );
    }

    // Filtros base
    const where: any = {
      companyId,
      deletedAt: null,
    };

    // Filtro por responsável
    if (responsibleId) {
      where.responsibleId = responsibleId;
    }

    // Filtro por status
    if (status) {
      where.status = status;
    }

    // Filtro por bloqueio
    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked;
    }

    // Filtro por data
    if (dateType) {
      const today = new Date();
      let dateStart: Date;
      let dateEnd: Date;

      // Define o período baseado no dateRange
      if (dateRange === 'week') {
        // Início da semana (domingo)
        dateStart = new Date(today);
        dateStart.setDate(today.getDate() - today.getDay());
        dateStart.setHours(0, 0, 0, 0);

        // Fim da semana (sábado)
        dateEnd = new Date(dateStart);
        dateEnd.setDate(dateStart.getDate() + 6);
        dateEnd.setHours(23, 59, 59, 999);
      } else if (dateRange === 'month') {
        // Início do mês
        dateStart = new Date(today.getFullYear(), today.getMonth(), 1);
        // Fim do mês
        dateEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (dateRange === 'custom' && startDate && endDate) {
        dateStart = startDate;
        dateEnd = endDate;
      }

      // Aplica o filtro baseado no tipo de data
      if (dateStart && dateEnd) {
        switch (dateType) {
          case 'estimated':
            where.estimatedEndDate = {
              gte: dateStart,
              lte: dateEnd,
            };
            break;
          case 'actual':
            where.actualEndDate = {
              gte: dateStart,
              lte: dateEnd,
            };
            break;
          case 'created':
            where.createdAt = {
              gte: dateStart,
              lte: dateEnd,
            };
            break;
        }
      }
    }

    // Restrições baseadas no papel
    if (userRole === UserRole.COLLABORATOR) {
      where.responsibleId = userId;
    } else if (userRole === UserRole.MANAGER) {
      const teamMembers = await this.prisma.user.findMany({
        where: { managerId: userId },
        select: { id: true },
      });
      where.responsibleId = {
        in: [userId, ...teamMembers.map(member => member.id)],
      };
    }

    const actions = await this.prisma.action.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
          },
        },
        kanbanOrder: {
          select: {
            id: true,
            column: true,
            position: true,
            sortOrder: true,
            lastMovedAt: true,
          },
        },
        checklistItems: {
          select: {
            id: true,
            description: true,
            isCompleted: true,
            completedAt: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        kanbanOrder: {
          sortOrder: 'asc',
        },
      },
    });

    // Atualiza isLate dinamicamente
    let actionsWithLate = actions.map(action => ({
      ...action,
      isLate: action.status !== 'DONE' && new Date() >= new Date(action.estimatedEndDate)
    }));

    // Filtra por isLate após o cálculo dinâmico
    if (isLate !== undefined) {
      actionsWithLate = actionsWithLate.filter(action => action.isLate === isLate);
    }

    return actionsWithLate;
  }

  async findOne(userId: string, userRole: UserRole, id: string) {
    const action = await this.prisma.action.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
          },
        },
        kanbanOrder: {
          select: {
            id: true,
            column: true,
            position: true,
            sortOrder: true,
            lastMovedAt: true,
          },
        },
        checklistItems: {
          select: {
            id: true,
            description: true,
            isCompleted: true,
            completedAt: true,
            order: true,
          },
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

    // Atualiza isLate dinamicamente
    return {
      ...action,
      isLate: action.status !== 'DONE' && new Date() >= new Date(action.estimatedEndDate)
    };
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

      // Verifica se o novo responsável pertence à empresa
      const newResponsible = await this.prisma.user.findFirst({
        where: {
          id: updateActionDto.responsibleId,
          companies: {
            some: {
              id: action.companyId,
            },
          },
        },
      });

      if (!newResponsible) {
        throw new NotFoundException('Novo responsável não encontrado ou não pertence à empresa');
      }
    }

    // Atualiza a ação
    return this.prisma.action.update({
      where: { id },
      data: {
        title: updateActionDto.title,
        description: updateActionDto.description,
        responsibleId: updateActionDto.responsibleId,
        status: updateActionDto.status,
        estimatedStartDate: updateActionDto.estimatedStartDate,
        estimatedEndDate: updateActionDto.estimatedEndDate,
        actualStartDate: updateActionDto.actualStartDate,
        actualEndDate: updateActionDto.actualEndDate,
        priority: updateActionDto.priority,
        isBlocked: updateActionDto.isBlocked,
        checklistItems: updateActionDto.checklistItems
          ? {
              updateMany: updateActionDto.checklistItems.map((item) => ({
                where: { id: item.id },
                data: {
                  description: item.description,
                  isCompleted: item.isCompleted,
                  order: item.order,
                },
              })),
            }
          : undefined,
        // Mantém o kanbanOrder exatamente como está
        kanbanOrder: {
          update: {
            // Não atualiza nenhum campo do kanbanOrder
            column: undefined,
            position: undefined,
            sortOrder: undefined,
            lastMovedAt: undefined,
          },
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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

  async findAvailableResponsibles(userId: string, userRole: UserRole, companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
          },
        },
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
        'Você não tem permissão para visualizar usuários desta empresa',
      );
    }

    // Se for colaborador, retorna apenas ele mesmo
    if (userRole === UserRole.COLLABORATOR) {
      const user = company.users.find(u => u.id === userId);
      return [user];
    }

    // Se for manager, retorna ele e seus colaboradores
    if (userRole === UserRole.MANAGER) {
      const manager = company.users.find(u => u.id === userId);
      const collaborators = company.users.filter(u => 
        u.role === UserRole.COLLABORATOR && 
        u.managerId === userId
      );
      return [manager, ...collaborators];
    }

    // Se for master, retorna todos os colaboradores da empresa
    if (userRole === UserRole.MASTER) {
      return company.users.filter(u => 
        u.role === UserRole.COLLABORATOR || 
        u.role === UserRole.MANAGER
      );
    }

    // Se for admin, retorna todos os usuários da empresa
    return company.users;
  }
} 