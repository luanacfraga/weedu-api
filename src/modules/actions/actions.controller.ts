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

  @Get('responsibles')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  findAvailableResponsibles(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Query('companyId') companyId: string,
  ) {
    return this.actionsService.findAvailableResponsibles(userId, userRole, companyId);
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
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Query('companyId') companyId: string,
    @Query('responsibleId') responsibleId?: string,
    @Query('status') status?: string,
    @Query('isBlocked') isBlocked?: boolean,
    @Query('isLate') isLate?: boolean,
    @Query('priority') priority?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dateType') dateType?: 'estimated' | 'actual' | 'created',
    @Query('dateRange') dateRange?: 'week' | 'month' | 'custom',
  ) {
    const actions = await this.actionsService.findAll(
      userId,
      userRole,
      companyId,
      responsibleId,
      status,
      isBlocked,
      isLate,
      priority,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      dateType,
      dateRange,
    );

    return actions.map(action => ({
      ...action,
      company: {
        id: action.company.id,
        name: action.company.name,
      },
      creator: {
        id: action.creator.id,
        name: action.creator.name,
      },
      responsible: {
        id: action.responsible.id,
        name: action.responsible.name,
      },
      kanbanOrder: {
        id: action.kanbanOrder.id,
        column: action.kanbanOrder.column,
        position: action.kanbanOrder.position,
        sortOrder: action.kanbanOrder.sortOrder,
        lastMovedAt: action.kanbanOrder.lastMovedAt,
      },
      checklistItems: action.checklistItems.map(item => ({
        id: item.id,
        description: item.description,
        isCompleted: item.isCompleted,
        completedAt: item.completedAt,
        order: item.order,
      })),
    }));
  }

  @Get(':id')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  async findOne(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
    @Param('id') id: string,
  ) {
    const action = await this.actionsService.findOne(userId, userRole, id);
    
    return {
      ...action,
      company: {
        id: action.company.id,
        name: action.company.name,
      },
      creator: {
        id: action.creator.id,
        name: action.creator.name,
      },
      responsible: {
        id: action.responsible.id,
        name: action.responsible.name,
      },
      kanbanOrder: {
        id: action.kanbanOrder.id,
        column: action.kanbanOrder.column,
        position: action.kanbanOrder.position,
        sortOrder: action.kanbanOrder.sortOrder,
        lastMovedAt: action.kanbanOrder.lastMovedAt,
      },
      checklistItems: action.checklistItems.map(item => ({
        id: item.id,
        description: item.description,
        isCompleted: item.isCompleted,
        completedAt: item.completedAt,
        order: item.order,
      })),
    };
  }

  @Patch(':id')
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.COLLABORATOR)
  updateAction(
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