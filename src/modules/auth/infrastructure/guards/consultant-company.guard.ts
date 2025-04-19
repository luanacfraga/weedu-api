import { PrismaService } from '@infrastructure/database/prisma.service';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ConsultantCompanyGuard implements CanActivate {
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

    // Verifica se o usuário é um consultor associado à empresa
    const consultantCompany = await this.prisma.consultantCompany.findUnique({
      where: {
        consultantId_companyId: {
          consultantId: user.id,
          companyId: companyId,
        },
      },
    });

    if (!consultantCompany) {
      throw new UnauthorizedException(
        'Consultor não tem acesso a esta empresa',
      );
    }

    return true;
  }
}
