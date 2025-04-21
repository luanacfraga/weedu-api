import { PrismaService } from '@infrastructure/database/prisma.service';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ManagerCompanyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const companyId = request.body.companyId;

    if (!user || !user.id || !companyId) {
      throw new UnauthorizedException(
        'Usuário não autenticado ou empresa não especificada',
      );
    }

    // Verifica se o usuário é um manager associado à empresa
    const userCompany = await this.prisma.user.findFirst({
      where: {
        id: user.id,
        role: 'MANAGER',
        companies: {
          some: {
            id: companyId,
          },
        },
      },
    });

    if (!userCompany) {
      throw new UnauthorizedException('Manager não tem acesso a esta empresa');
    }

    return true;
  }
}
