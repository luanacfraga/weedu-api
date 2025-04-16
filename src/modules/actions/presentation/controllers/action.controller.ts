import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateActionDto } from '../../application/dtos/create-action.dto';
import { ActionService } from '../../application/services/action.service';

@Controller('actions')
@UseGuards(JwtAuthGuard)
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post()
  async create(@Body() createActionDto: CreateActionDto) {
    return this.actionService.create(createActionDto);
  }

  @Get('company/:companyId')
  async findAll(@Param('companyId') companyId: string) {
    return this.actionService.findAll(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.actionService.findOne(id);
  }
}
