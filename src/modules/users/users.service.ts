import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { CreateMasterUserDto } from './dto/create-master-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAdmin(createAdminDto: CreateAdminDto) {
    // Verificar se já existe um usuário com este email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    // Criar o usuário admin
    return this.prisma.user.create({
      data: {
        name: createAdminDto.name,
        email: createAdminDto.email,
        password: hashedPassword,
        role: 'ADMIN',
        plan: 'FREE',
        maxCompanies: 999999, // Pode ter múltiplas empresas
        maxActions: 999999, // Não tem limite de ações
      }
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
      include: {
        limits: true
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
          role: 'MASTER',
          plan: plan.type,
          maxCompanies: 999999, // Pode ter múltiplas empresas
          maxActions: 999999, // Não tem limite de ações (o limite é por empresa)
          currentPlan: {
            connect: { id: plan.id }
          }
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
          plan: {
            connect: { id: plan.id } // Usa o mesmo plano do MASTER
          },
          owner: {
            connect: { id: masterUser.id }
          },
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

  async createManager(createManagerDto: CreateManagerDto, currentUser: any) {
    // Verificar se o usuário atual é master e tem acesso à empresa
    const userCompany = await this.prisma.company.findFirst({
      where: {
        id: createManagerDto.companyId,
        owner: { id: currentUser.id, role: 'MASTER' }
      },
      include: {
        owner: {
          include: {
            currentPlan: {
              include: {
                limits: true
              }
            }
          }
        }
      }
    });

    if (!userCompany) {
      throw new ForbiddenException('Você não tem permissão para criar gestores nesta empresa');
    }

    // Verificar limite de gestores no plano do MASTER
    const managerLimit = userCompany.owner.currentPlan.limits.find(limit => limit.feature === 'MANAGERS');
    if (managerLimit) {
      const currentManagers = await this.prisma.user.count({
        where: {
          companies: {
            some: {
              id: createManagerDto.companyId
            }
          },
          role: 'MANAGER'
        }
      });

      if (currentManagers >= managerLimit.limit) {
        throw new ForbiddenException('Limite de gestores atingido para este plano');
      }
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createManagerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createManagerDto.password, 10);

    // Criar o gestor
    return this.prisma.user.create({
      data: {
        name: createManagerDto.name,
        email: createManagerDto.email,
        password: hashedPassword,
        role: 'MANAGER',
        plan: userCompany.owner.currentPlan.type,
        maxCompanies: 1, // Só pode pertencer a uma empresa
        maxActions: 30, // Limite de ações por gestor
        currentPlan: {
          connect: { id: userCompany.owner.currentPlan.id }
        },
        companies: {
          connect: { id: createManagerDto.companyId }
        }
      }
    });
  }

  async createCollaborator(createCollaboratorDto: CreateCollaboratorDto, currentUser: any) {
    // Verificar se o usuário atual é master/manager e tem acesso à empresa
    const userCompany = await this.prisma.company.findFirst({
      where: {
        id: createCollaboratorDto.companyId,
        OR: [
          { owner: { id: currentUser.id, role: 'MASTER' } },
          { users: { some: { id: currentUser.id, role: 'MANAGER' } } }
        ]
      },
      include: {
        owner: {
          include: {
            currentPlan: {
              include: {
                limits: true
              }
            }
          }
        }
      }
    });

    if (!userCompany) {
      throw new ForbiddenException('Você não tem permissão para criar colaboradores nesta empresa');
    }

    // Verificar limite de colaboradores no plano do MASTER
    const collaboratorLimit = userCompany.owner.currentPlan.limits.find(limit => limit.feature === 'COLLABORATORS');
    if (collaboratorLimit) {
      const currentCollaborators = await this.prisma.user.count({
        where: {
          companies: {
            some: {
              id: createCollaboratorDto.companyId
            }
          },
          role: 'COLLABORATOR'
        }
      });

      if (currentCollaborators >= collaboratorLimit.limit) {
        throw new ForbiddenException('Limite de colaboradores atingido para este plano');
      }
    }

    // Verificar se o gestor existe e pertence à mesma empresa
    const manager = await this.prisma.user.findFirst({
      where: {
        id: createCollaboratorDto.managerId,
        role: 'MANAGER',
        companies: { some: { id: createCollaboratorDto.companyId } }
      }
    });

    if (!manager) {
      throw new NotFoundException('Gestor não encontrado ou não pertence à empresa');
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createCollaboratorDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createCollaboratorDto.password, 10);

    // Criar o colaborador
    return this.prisma.user.create({
      data: {
        name: createCollaboratorDto.name,
        email: createCollaboratorDto.email,
        password: hashedPassword,
        role: 'COLLABORATOR',
        plan: userCompany.owner.currentPlan.type,
        maxCompanies: 1, // Só pode pertencer a uma empresa
        maxActions: 30, // Limite de ações por colaborador
        currentPlan: {
          connect: { id: userCompany.owner.currentPlan.id }
        },
        manager: {
          connect: { id: createCollaboratorDto.managerId }
        },
        companies: {
          connect: { id: createCollaboratorDto.companyId }
        }
      }
    });
  }

  async getManagerTeam(managerId: string, currentUser: any) {
    // Verificar se o usuário atual tem permissão para ver a equipe
    const manager = await this.prisma.user.findFirst({
      where: {
        id: managerId,
        role: 'MANAGER',
        OR: [
          // Se o usuário atual é MASTER, pode ver qualquer equipe
          { companies: { some: { owner: { id: currentUser.id, role: 'MASTER' } } } },
          // Se o usuário atual é o próprio MANAGER
          { id: currentUser.id }
        ]
      }
    });

    if (!manager) {
      throw new ForbiddenException('Você não tem permissão para ver esta equipe');
    }

    // Buscar todos os colaboradores do manager
    return this.prisma.user.findMany({
      where: {
        managerId: managerId,
        role: 'COLLABORATOR',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        companies: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
} 