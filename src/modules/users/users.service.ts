import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateMasterUserDto } from './dto/create-master-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAdmin(createAdminUserDto: CreateAdminUserDto) {
    // Verificar se já existe um usuário com este email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);

    // Criar o usuário admin
    return this.prisma.user.create({
      data: {
        name: createAdminUserDto.name,
        email: createAdminUserDto.email,
        password: hashedPassword,
        role: 'ADMIN',
        plan: 'FREE',
        maxCompanies: 1,
        maxActions: 30,
      },
    });
  }

  async createMaster(createMasterUserDto: CreateMasterUserDto) {
    // Verificar se já existe um usuário com este email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createMasterUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Verificar se já existe uma empresa com este CNPJ
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createMasterUserDto.company.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('Já existe uma empresa com este CNPJ');
    }

    // Verificar se o plano existe
    const plan = await this.prisma.plan.findUnique({
      where: { id: createMasterUserDto.planId },
      select: {
        id: true,
        type: true
      }
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createMasterUserDto.password, 10);

    // Criar o usuário master e a empresa em uma transação
    return this.prisma.$transaction(async (prisma) => {
      // Criar o usuário master
      const masterUser = await prisma.user.create({
        data: {
          name: createMasterUserDto.name,
          email: createMasterUserDto.email,
          password: hashedPassword,
          role: 'ADMIN', // Usando ADMIN por enquanto, já que MASTER não está no enum
          plan: plan.type,
          maxCompanies: 999999,
          maxActions: 999999,
          currentPlanId: plan.id
        }
      });

      // Criar a empresa
      const company = await prisma.company.create({
        data: {
          name: createMasterUserDto.company.name,
          cnpj: createMasterUserDto.company.cnpj,
          address: createMasterUserDto.company.address,
          phone: createMasterUserDto.company.phone,
          email: createMasterUserDto.company.email,
          planId: plan.id,
          ownerId: masterUser.id,
          users: {
            connect: { id: masterUser.id }
          }
        }
      });

      // Atualizar o usuário com a empresa atual
      await prisma.user.update({
        where: { id: masterUser.id },
        data: {
          companies: {
            connect: { id: company.id }
          }
        }
      });

      return {
        user: masterUser,
        company,
        plan
      };
    });
  }
} 