import { PrismaService } from '@infrastructure/database/prisma.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/services/auth.service';
import { ConsultantGuard } from './infrastructure/guards/consultant.guard';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    JwtAuthGuard,
    ConsultantGuard,
  ],
  exports: [AuthService, JwtAuthGuard, ConsultantGuard],
})
export class AuthModule {}
