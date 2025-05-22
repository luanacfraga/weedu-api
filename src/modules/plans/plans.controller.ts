import { Roles } from '@/core/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlansService } from './plans.service';

interface Plan {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  limits: {
    id: string;
    feature: string;
    limit: number;
  }[];
}

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createPlanDto: CreatePlanDto, @Request() req): Promise<Plan> {
    return this.plansService.createPlan(createPlanDto, req.user.id);
  }

  @Get()
  findAll(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Plan> {
    return this.plansService.findOne(id);
  }
} 