import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { ActionsService } from '../actions.service';

@Controller('actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get('company/employees')
  @UseGuards(JwtAuthGuard)
  async getCompanyEmployees(
    @Req() req: any,
    @Query('companyId') companyId: string,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.actionsService.findAvailableResponsibles(userId, userRole, companyId);
  }
} 