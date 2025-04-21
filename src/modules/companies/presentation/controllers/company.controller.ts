/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AdminGuard } from '@modules/auth/infrastructure/guards/admin.guard';
import { ConsultantGuard } from '@modules/auth/infrastructure/guards/consultant.guard';
import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from '../../application/services/company.service';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('register')
  async register(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.register(createCompanyDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Put(':id/plan')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.companyService.updatePlan(id, updatePlanDto.plan);
  }

  @Get('consultant/my-companies')
  @UseGuards(JwtAuthGuard, ConsultantGuard)
  async findMyCompanies(@Request() req) {
    return this.companyService.findConsultantCompanies(req.user.id);
  }

  @Post('consultant/add-company')
  @UseGuards(JwtAuthGuard, ConsultantGuard)
  async addCompany(@Request() req, @Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.addCompanyToConsultant(
      req.user.id,
      createCompanyDto,
    );
  }

  @Get('select')
  @UseGuards(JwtAuthGuard)
  async findAllForSelect() {
    return this.companyService.findAllForSelect();
  }

  @Get('consultant/select')
  @UseGuards(JwtAuthGuard, ConsultantGuard)
  async findMyCompaniesForSelect(@Request() req) {
    return this.companyService.findConsultantCompaniesForSelect(req.user.id);
  }

  @Get(':id/managers')
  @UseGuards(JwtAuthGuard)
  async findManagers(@Param('id') id: string) {
    return this.companyService.findManagers(id);
  }
}
