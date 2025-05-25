import { PrismaService } from '@/infrastructure/database/prisma.service';
import { KanbanColumn, UserRole } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
export declare class ActionsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    moveAction(userId: string, userRole: UserRole, actionId: string, toColumn: KanbanColumn, newPosition: number): Promise<{
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
    findAll(userId: string, userRole: UserRole, companyId: string, responsibleId?: string, status?: string, isBlocked?: boolean, isLate?: boolean, priority?: string, startDate?: Date, endDate?: Date, dateType?: 'estimated' | 'actual' | 'created', dateRange?: 'week' | 'month' | 'custom'): Promise<{
        isLate: boolean;
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
        checklistItems: {
            id: string;
            description: string;
            isCompleted: boolean;
            completedAt: Date;
            order: number;
        }[];
        kanbanOrder: {
            id: string;
            column: import(".prisma/client").$Enums.KanbanColumn;
            position: number;
            lastMovedAt: Date;
            sortOrder: number;
        };
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
        priority: import(".prisma/client").$Enums.ActionPriority;
        responsibleId: string;
    }[]>;
    findOne(userId: string, userRole: UserRole, id: string): Promise<{
        isLate: boolean;
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
        checklistItems: {
            id: string;
            description: string;
            isCompleted: boolean;
            completedAt: Date;
            order: number;
        }[];
        kanbanOrder: {
            id: string;
            column: import(".prisma/client").$Enums.KanbanColumn;
            position: number;
            lastMovedAt: Date;
            sortOrder: number;
        };
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
        priority: import(".prisma/client").$Enums.ActionPriority;
        responsibleId: string;
    }>;
    update(userId: string, userRole: UserRole, id: string, updateActionDto: UpdateActionDto): Promise<{
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
    findAvailableResponsibles(userId: string, userRole: UserRole, companyId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string;
    }[]>;
}
