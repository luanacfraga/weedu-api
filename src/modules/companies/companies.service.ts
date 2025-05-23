import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async createCompany(createCompanyDto: CreateCompanyDto, userId: string) {
    // Verificar se o usuário é MASTER
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        currentPlan: true
      }
    });

    if (!user || user.role !== 'MASTER') {
      throw new ForbiddenException('Apenas usuários MASTER podem criar empresas');
    }

    // Verificar se já existe uma empresa com este CNPJ
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('Já existe uma empresa com este CNPJ');
    }

    // Verificar se o plano existe
    const plan = await this.prisma.plan.findUnique({
      where: { id: createCompanyDto.planId },
      include: {
        limits: true
      }
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Criar a empresa
    const company = await this.prisma.company.create({
      data: {
        name: createCompanyDto.name,
        cnpj: createCompanyDto.cnpj,
        address: createCompanyDto.address,
        phone: createCompanyDto.phone,
        email: createCompanyDto.email,
        plan: {
          connect: { id: plan.id }
        },
        owner: {
          connect: { id: userId }
        },
        users: {
          connect: { id: userId }
        }
      },
      include: {
        plan: {
          include: {
            limits: true
          }
        }
      }
    });

    return company;
  }

  async findManagers(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: {
            role: UserRole.MANAGER,
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company.users;
  }

  async findMasterCompanies(masterId: string) {
    const companies = await this.prisma.company.findMany({
      where: {
        ownerId: masterId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return companies;
  }
} 