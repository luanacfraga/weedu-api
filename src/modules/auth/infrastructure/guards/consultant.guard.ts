import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

@Injectable()
export class ConsultantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user || !user.id || !user.role) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    console.log('ConsultantGuard - User:', user);
    console.log('ConsultantGuard - User Role:', user.role);
    console.log('ConsultantGuard - Expected Role:', UserRole.CONSULTANT);

    return user.role === UserRole.CONSULTANT;
  }
}
