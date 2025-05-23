import { Roles } from '@/core/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles('MASTER')
  create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    return this.companiesService.createCompany(createCompanyDto, req.user.id);
  }

  @Get('master')
  @Roles(UserRole.MASTER)
  async findMasterCompanies(@Request() req) {
    return this.companiesService.findMasterCompanies(req.user.id);
  }

  @Get(':id/managers')
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  async findManagers(@Param('id') id: string) {
    return this.companiesService.findManagers(id);
  }
} 