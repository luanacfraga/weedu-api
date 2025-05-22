import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [PlansService],
})
export class PlansModule {} 