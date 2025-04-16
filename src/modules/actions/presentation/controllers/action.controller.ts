import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
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

  @Put(':id/start')
  async start(@Param('id') id: string) {
    return this.actionService.startAction(id);
  }

  @Put(':id/complete')
  async complete(@Param('id') id: string) {
    return this.actionService.completeAction(id);
  }

  @Get('company/:companyId')
  async findAll(@Param('companyId') companyId: string) {
    return this.actionService.findAll(companyId);
  }

  @Get('company/:companyId/today')
  async findTodayActions(@Param('companyId') companyId: string) {
    return this.actionService.findTodayActions(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.actionService.findOne(id);
  }
}
