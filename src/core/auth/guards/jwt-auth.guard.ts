import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    this.logger.debug(`JWT Auth - Error: ${err}, User: ${JSON.stringify(user)}, Info: ${info}`);

    if (err) {
      this.logger.error(`JWT Auth Error: ${err.message}`);
      throw new UnauthorizedException('Erro na autenticação');
    }

    if (!user) {
      this.logger.error('JWT Auth: Usuário não encontrado no token');
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return user;
  }
} 