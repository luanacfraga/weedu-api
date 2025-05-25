import { GetUser } from '@/core/auth/decorators/get-user.decorator';
import { Roles } from '@/core/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ProductivityMetricsDto } from '../dto/productivity-metrics.dto';
import { ProductivityMetricsService } from '../services/productivity-metrics.service';

@Controller('actions/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductivityMetricsController {
  constructor(
    private readonly productivityMetricsService: ProductivityMetricsService,
  ) {}

  @Get('productivity')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  async getProductivityMetrics(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Query('companyId') companyId: string,
    @Query() dto: ProductivityMetricsDto,
  ) {
    return this.productivityMetricsService.getProductivityMetrics(
      userId,
      companyId,
      dto,
    );
  }

  @Get('team')
  @UseGuards(JwtAuthGuard)
  async getTeamMetrics(
    @Req() req: any,
    @Query() dto: ProductivityMetricsDto,
  ) {
    // O gestor deve ser autenticado e ter companyId e userId
    const managerId = req.user.id;
    const companyId = req.user.companyId;
    return this.productivityMetricsService.getTeamMetrics(managerId, companyId, dto);
  }
} 