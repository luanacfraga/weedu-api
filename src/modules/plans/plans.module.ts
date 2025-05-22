import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { JwtStrategy } from '@/core/auth/strategies/jwt.strategy';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  imports: [PassportModule],
  controllers: [PlansController],
  providers: [PlansService, PrismaService, JwtAuthGuard, RolesGuard, JwtStrategy],
  exports: [PlansService],
})
export class PlansModule {} 