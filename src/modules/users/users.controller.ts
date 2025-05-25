import { Roles } from '@/core/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { Body, Controller, Get, Param, Post, Query, Req, Request, UseGuards } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { CreateMasterUserDto } from './dto/create-master-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @Post('master')
  createMaster(@Body() createMasterUserDto: CreateMasterUserDto) {
    return this.usersService.createMaster(createMasterUserDto);
  }

  @Post('manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MASTER')
  createManager(@Body() createManagerDto: CreateManagerDto, @Request() req) {
    return this.usersService.createManager(createManagerDto, req.user);
  }

  @Post('collaborator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MASTER', 'MANAGER')
  createCollaborator(@Body() createCollaboratorDto: CreateCollaboratorDto, @Request() req) {
    return this.usersService.createCollaborator(createCollaboratorDto, req.user);
  }

  @Get('manager/:id/team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MASTER', 'MANAGER')
  getManagerTeam(@Param('id') id: string, @Request() req) {
    return this.usersService.getManagerTeam(id, req.user);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCompanyEmployees(
    @Req() req: any,
    @Query('companyId') companyId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('isActive') isActive?: string,
    @Query('managerId') managerId?: string,
    @Query('onlyManagers') onlyManagers?: string,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.usersService.findCompanyEmployees(userId, userRole, companyId, {
      page: Number(page),
      limit: Number(limit),
      name,
      email,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      managerId,
      onlyManagers: onlyManagers === 'true',
    });
  }
} 