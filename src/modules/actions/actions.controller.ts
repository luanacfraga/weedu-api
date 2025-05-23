import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { KanbanColumn, UserRole } from '@prisma/client';

import { GetUser } from '@/core/auth/decorators/get-user.decorator';
import { Roles } from '@/core/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/auth/guards/roles.guard';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { AISuggestionService } from './services/ai-suggestion.service';

@Controller('actions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionsController {
  constructor(
    private readonly actionsService: ActionsService,
    private readonly aiSuggestionService: AISuggestionService,
  ) {}

  @Post('suggest')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  async suggestAction(
    @Body('description') description: string,
  ) {
    return this.aiSuggestionService.generateActionSuggestion(description);
  }

  @Post()
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  createAction(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Body() createActionDto: CreateActionDto,
  ) {
    return this.actionsService.createAction(userId, userRole, createActionDto);
  }

  @Get()
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  findAll(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Query('companyId') companyId: string,
    @Query('responsibleId') responsibleId?: string,
    @Query('status') status?: string,
  ) {
    return this.actionsService.findAll(userId, userRole, companyId, responsibleId, status);
  }

  @Get(':id')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  findOne(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Param('id') id: string,
  ) {
    return this.actionsService.findOne(userId, userRole, id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  update(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Param('id') id: string,
    @Body() updateActionDto: UpdateActionDto,
  ) {
    return this.actionsService.update(userId, userRole, id, updateActionDto);
  }

  @Patch(':id/move')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  moveAction(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Param('id') id: string,
    @Body('column') column: KanbanColumn,
    @Body('position') position: number,
  ) {
    return this.actionsService.moveAction(userId, userRole, id, column, position);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  remove(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.actionsService.remove(userId, id);
  }
} 