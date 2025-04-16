import { PrismaService } from '@infrastructure/database/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateActionDto } from '../dtos/create-action.dto';

@Injectable()
export class ActionService {
  constructor(private prisma: PrismaService) {}

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
        status: 'PENDING',
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
}
