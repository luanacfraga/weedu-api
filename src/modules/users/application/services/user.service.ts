import { PrismaService } from '@infrastructure/database/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '@shared/types/user.types';
import { hash } from 'bcrypt';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { FindManagerUsersDto } from '../../presentation/dtos/find-manager-users.dto';
import { FindUsersDto } from '../../presentation/dtos/find-users.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUser: AuthenticatedUser,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se o usuário atual tem permissão para atualizar
    const canUpdate = await this.canUpdateUser(currentUser, {
      id: user.id,
      managerId: user.managerId,
      companies: user.companies,
    });
    if (!canUpdate) {
      throw new UnauthorizedException(
        'Você não tem permissão para atualizar este usuário',
      );
    }

    // Se estiver alterando o manager, verifica se o novo manager existe e é da mesma empresa
    if (updateUserDto.managerId) {
      const newManager = await this.prisma.user.findUnique({
        where: { id: updateUserDto.managerId },
        include: { companies: true },
      });

      if (!newManager) {
        throw new BadRequestException('Gestor não encontrado');
      }

      if (newManager.role !== 'MANAGER') {
        throw new BadRequestException('O usuário indicado não é um gestor');
      }

      const sameCompany = newManager.companies.some((company) =>
        user.companies.some((userCompany) => userCompany.id === company.id),
      );

      if (!sameCompany) {
        throw new BadRequestException('O gestor não pertence à mesma empresa');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateUserDto.name,
        email: updateUserDto.email,
        role: updateUserDto.role,
        isActive: updateUserDto.isActive,
        managerId: updateUserDto.managerId,
      },
    });
  }

  async deactivateUser(userId: string, currentUser: AuthenticatedUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const canUpdate = await this.canUpdateUser(currentUser, {
      id: user.id,
      managerId: user.managerId,
      companies: user.companies,
    });
    if (!canUpdate) {
      throw new UnauthorizedException(
        'Você não tem permissão para desativar este usuário',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });
  }

  async activateUser(userId: string, currentUser: AuthenticatedUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const canUpdate = await this.canUpdateUser(currentUser, {
      id: user.id,
      managerId: user.managerId,
      companies: user.companies,
    });
    if (!canUpdate) {
      throw new UnauthorizedException(
        'Você não tem permissão para ativar este usuário',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },
    });
  }

  private async canUpdateUser(
    currentUser: AuthenticatedUser,
    targetUser: {
      id: string;
      managerId: string | null;
      companies: { id: string }[];
    },
  ): Promise<boolean> {
    // Admin pode atualizar qualquer usuário
    if (currentUser.role === 'ADMIN') {
      return true;
    }

    // Consultor pode atualizar usuários da mesma empresa
    if (currentUser.role === 'CONSULTANT') {
      const currentUserCompanies = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { companies: true },
      });

      const targetUserCompanies = await this.prisma.user.findUnique({
        where: { id: targetUser.id },
        include: { companies: true },
      });

      return currentUserCompanies.companies.some((company) =>
        targetUserCompanies.companies.some(
          (targetCompany) => targetCompany.id === company.id,
        ),
      );
    }

    // Gestor pode atualizar seus colaboradores
    if (currentUser.role === 'MANAGER') {
      return targetUser.managerId === currentUser.id;
    }

    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const { companyId, managerId, password, ...userData } = createUserDto;
    const hashedPassword = await hash(password, 10);

    if (managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: managerId },
        include: { companies: true },
      });

      if (!manager) {
        throw new BadRequestException('Gestor não encontrado');
      }

      if (manager.role !== 'MANAGER') {
        throw new BadRequestException('O usuário indicado não é um gestor');
      }

      const managerBelongsToCompany = manager.companies.some(
        (company) => company.id === companyId,
      );

      if (!managerBelongsToCompany) {
        throw new BadRequestException('O gestor não pertence à mesma empresa');
      }
    }

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        managerId,
        companies: {
          connect: {
            id: companyId,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAllByCompany(
    companyId: string,
    { page = 1, limit = 10 }: FindUsersDto,
  ): Promise<{
    data: Record<string, any>[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const where = {
      companies: {
        some: {
          id: companyId,
        },
      },
      deletedAt: null,
    };

    const skip = (page - 1) * limit;

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          manager: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findAllByManager(
    managerId: string,
    { page = 1, limit = 10 }: FindManagerUsersDto,
  ): Promise<{
    data: Record<string, any>[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: {
        companies: true,
      },
    });

    if (!manager) {
      throw new NotFoundException('Gestor não encontrado');
    }

    if (manager.role !== 'MANAGER') {
      throw new BadRequestException('O usuário não é um gestor');
    }

    if (!manager.companies || manager.companies.length === 0) {
      throw new BadRequestException(
        'O gestor não está associado a nenhuma empresa',
      );
    }

    const companyId = manager.companies[0].id;

    const where = {
      managerId,
      companies: {
        some: {
          id: companyId,
        },
      },
      deletedAt: null,
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
