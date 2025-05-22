import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';

interface Plan {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  limits: {
    id: string;
    feature: string;
    limit: number;
  }[];
}

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async createPlan(createPlanDto: CreatePlanDto, userId: string): Promise<Plan> {
    // Verificar se o usuário é admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem criar planos');
    }

    // Criar o plano
    return this.prisma.plan.create({
      data: {
        type: createPlanDto.type,
        name: createPlanDto.name,
        description: createPlanDto.description,
        price: createPlanDto.price,
        features: createPlanDto.features,
        limits: {
          create: createPlanDto.limits.map(limit => ({
            feature: limit.feature,
            limit: limit.limit
          }))
        }
      },
      include: {
        limits: true
      }
    });
  }

  async findAll(): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      include: {
        limits: true
      }
    });
  }

  async findOne(id: string): Promise<Plan> {
    return this.prisma.plan.findUnique({
      where: { id },
      include: {
        limits: true
      }
    });
  }
} 