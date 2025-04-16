import { PrismaService } from '@infrastructure/database/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ActionStatus } from '@prisma/client';
import { CreateActionDto } from '../dtos/create-action.dto';

@Injectable()
export class ActionService {
  constructor(private prisma: PrismaService) {}

  private calculateStatus(
    startDate: Date,
    endDate: Date,
    actualStartDate?: Date | null,
    actualEndDate?: Date | null,
  ): ActionStatus {
    const now = new Date();

    // Se ainda não começou
    if (!actualStartDate) {
      if (now > startDate) {
        return ActionStatus.TO_START_DELAYED;
      }
      return ActionStatus.TO_START;
    }

    // Se está em andamento
    if (!actualEndDate) {
      if (now > endDate) {
        return ActionStatus.IN_PROGRESS_DELAYED;
      }
      return ActionStatus.IN_PROGRESS;
    }

    // Se foi finalizada
    if (actualEndDate <= endDate) {
      return ActionStatus.COMPLETED_ON_TIME;
    }
    return ActionStatus.COMPLETED_DELAYED;
  }

  async create(createActionDto: CreateActionDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: createActionDto.companyId },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    if (company.plan === 'FREE' && company.actionCount >= company.maxActions) {
      throw new BadRequestException(
        'Limite de planos de ação atingido para o plano FREE',
      );
    }

    const action = await this.prisma.action.create({
      data: {
        title: createActionDto.title,
        description: createActionDto.description,
        problem: createActionDto.problem,
        actionPlan: createActionDto.actionPlan,
        why: createActionDto.why,
        observation: createActionDto.observation,
        startDate: new Date(createActionDto.startDate),
        endDate: new Date(createActionDto.endDate),
        status: ActionStatus.TO_START,
        companyId: createActionDto.companyId,
        managerId: createActionDto.managerId,
        creatorId: createActionDto.creatorId,
        checklist: createActionDto.checklist,
      },
    });

    await this.prisma.company.update({
      where: { id: company.id },
      data: {
        actionCount: {
          increment: 1,
        },
      },
    });

    return action;
  }

  async startAction(id: string) {
    const action = await this.prisma.action.findUnique({
      where: { id },
    });

    if (!action) {
      throw new BadRequestException('Plano de ação não encontrado');
    }

    const actualStartDate = new Date();
    const status = this.calculateStatus(
      action.startDate,
      action.endDate,
      actualStartDate,
      action.actualEndDate,
    );

    return this.prisma.action.update({
      where: { id },
      data: {
        actualStartDate,
        status,
      },
    });
  }

  async completeAction(id: string) {
    const action = await this.prisma.action.findUnique({
      where: { id },
    });

    if (!action) {
      throw new BadRequestException('Plano de ação não encontrado');
    }

    const actualEndDate = new Date();
    const status = this.calculateStatus(
      action.startDate,
      action.endDate,
      action.actualStartDate,
      actualEndDate,
    );

    return this.prisma.action.update({
      where: { id },
      data: {
        actualEndDate,
        status,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.action.findMany({
      where: {
        companyId,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.action.findUnique({
      where: { id },
    });
  }

  async findTodayActions(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.action.findMany({
      where: {
        companyId,
        endDate: {
          gte: today,
          lt: tomorrow,
        },
        deletedAt: null,
      },
      orderBy: {
        endDate: 'asc',
      },
    });
  }
}
