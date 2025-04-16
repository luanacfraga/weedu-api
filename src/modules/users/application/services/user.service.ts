import { PrismaService } from '@infrastructure/database/prisma.service';
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUser: any,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Verifica se o usuário atual tem permissão para atualizar
    const canUpdate = await this.canUpdateUser(currentUser, user);
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

      if (newManager.role !== UserRole.MANAGER) {
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

  async deactivateUser(userId: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const canUpdate = await this.canUpdateUser(currentUser, user);
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

  async activateUser(userId: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const canUpdate = await this.canUpdateUser(currentUser, user);
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
    currentUser: any,
    targetUser: any,
  ): Promise<boolean> {
    // Admin pode atualizar qualquer usuário
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    // Consultor pode atualizar usuários da mesma empresa
    if (currentUser.role === UserRole.CONSULTANT) {
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
    if (currentUser.role === UserRole.MANAGER) {
      return targetUser.managerId === currentUser.id;
    }

    return false;
  }
}
