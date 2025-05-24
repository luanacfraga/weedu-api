import { KanbanColumn, UserRole } from '@prisma/client';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { AISuggestionService } from './services/ai-suggestion.service';
export declare class ActionsController {
    private readonly actionsService;
    private readonly aiSuggestionService;
    constructor(actionsService: ActionsService, aiSuggestionService: AISuggestionService);
    suggestAction(description: string): Promise<import("./dto/ai-suggestion.dto").AISuggestionDto>;
    findAvailableResponsibles(userId: string, userRole: UserRole, companyId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string;
    }[]>;
    createAction(userId: string, userRole: UserRole, createActionDto: CreateActionDto): Promise<{
        company: {
            id: string;
            name: string;
        };
        creator: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        responsible: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        checklistItems: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            actionId: string;
            isCompleted: boolean;
            completedAt: Date | null;
            order: number;
        }[];
        kanbanOrder: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            column: import(".prisma/client").$Enums.KanbanColumn;
            position: number;
            lastMovedAt: Date;
            sortOrder: number;
            actionId: string;
        };
    } & {
        id: string;
        title: string;
        description: string;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        companyId: string;
        creatorId: string;
        blockedReason: string | null;
        estimatedEndDate: Date;
        estimatedStartDate: Date;
        isBlocked: boolean;
        isLate: boolean;
        priority: import(".prisma/client").$Enums.ActionPriority;
        responsibleId: string;
    }>;
    findAll(userId: string, userRole: UserRole, companyId: string, responsibleId?: string, status?: string, isBlocked?: boolean, isLate?: boolean, priority?: string, startDate?: string, endDate?: string, dateType?: 'estimated' | 'actual' | 'created', dateRange?: 'week' | 'month' | 'custom'): Promise<{
        company: {
            id: string;
            name: string;
        };
        creator: {
            id: string;
            name: string;
        };
        responsible: {
            id: string;
            name: string;
        };
        kanbanOrder: {
            id: string;
            column: import(".prisma/client").$Enums.KanbanColumn;
            position: number;
            sortOrder: number;
            lastMovedAt: Date;
        };
        checklistItems: {
            id: string;
            description: string;
            isCompleted: boolean;
            completedAt: Date;
            order: number;
        }[];
        id: string;
        title: string;
        description: string;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        companyId: string;
        creatorId: string;
        blockedReason: string | null;
        estimatedEndDate: Date;
        estimatedStartDate: Date;
        isBlocked: boolean;
        isLate: boolean;
        priority: import(".prisma/client").$Enums.ActionPriority;
        responsibleId: string;
    }[]>;
    findOne(userId: string, userRole: UserRole, id: string): Promise<{
        company: {
            id: string;
            name: string;
        };
        creator: {
            id: string;
            name: string;
        };
        responsible: {
            id: string;
            name: string;
        };
        kanbanOrder: {
            id: string;
            column: import(".prisma/client").$Enums.KanbanColumn;
            position: number;
            sortOrder: number;
            lastMovedAt: Date;
        };
        checklistItems: {
            id: string;
            description: string;
            isCompleted: boolean;
            completedAt: Date;
            order: number;
        }[];
        id: string;
        title: string;
        description: string;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        companyId: string;
        creatorId: string;
        blockedReason: string | null;
        estimatedEndDate: Date;
        estimatedStartDate: Date;
        isBlocked: boolean;
        isLate: boolean;
        priority: import(".prisma/client").$Enums.ActionPriority;
        responsibleId: string;
    }>;
    updateAction(userId: string, userRole: UserRole, id: string, updateActionDto: UpdateActionDto): Promise<{
        company: {
            id: string;
            name: string;
        };
        creator: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        responsible: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        checklistItems: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            actionId: string;
            isCompleted: boolean;
            completedAt: Date | null;
            order: number;
        }[];
        kanbanOrder: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            column: import(".prisma/client").$Enums.KanbanColumn;
            position: number;
            lastMovedAt: Date;
            sortOrder: number;
            actionId: string;
        };
    } & {
        id: string;
        title: string;
        description: string;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        companyId: string;
        creatorId: string;
        blockedReason: string | null;
        estimatedEndDate: Date;
        estimatedStartDate: Date;
        isBlocked: boolean;
        isLate: boolean;
        priority: import(".prisma/client").$Enums.ActionPriority;
        responsibleId: string;
    }>;
    moveAction(userId: string, userRole: UserRole, id: string, column: KanbanColumn, position: number): Promise<{
        company: {
            id: string;
            name: string;
        };
        creator: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        responsible: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        checklistItems: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            actionId: string;
            isCompleted: boolean;
            completedAt: Date | null;
            order: number;
        }[];
        kanbanOrder: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            column: import(".prisma/client").$Enums.KanbanColumn;
            position: number;
            lastMovedAt: Date;
            sortOrder: number;
            actionId: string;
        };
    } & {
        id: string;
        title: string;
        description: string;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        companyId: string;
        creatorId: string;
        blockedReason: string | null;
        estimatedEndDate: Date;
        estimatedStartDate: Date;
        isBlocked: boolean;
        isLate: boolean;
        priority: import(".prisma/client").$Enums.ActionPriority;
        responsibleId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
