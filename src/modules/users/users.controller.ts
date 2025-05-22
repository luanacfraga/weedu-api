import { Roles } from '@/core/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
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
} 