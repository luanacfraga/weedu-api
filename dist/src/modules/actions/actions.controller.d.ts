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
    createAction(userId: string, userRole: UserRole, createActionDto: CreateActionDto): Promise<{
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            email: string | null;
            deletedAt: Date | null;
            cnpj: string;
            address: string | null;
            phone: string | null;
            ownerId: string;
        };
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
        creator: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        responsible: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        companyId: string;
        responsibleId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        estimatedStartDate: Date;
        estimatedEndDate: Date;
        priority: import(".prisma/client").$Enums.ActionPriority;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        creatorId: string;
        blockedReason: string | null;
        isBlocked: boolean;
        isLate: boolean;
    }>;
    findAll(userId: string, userRole: UserRole, companyId: string, responsibleId?: string, status?: string): Promise<({
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            email: string | null;
            deletedAt: Date | null;
            cnpj: string;
            address: string | null;
            phone: string | null;
            ownerId: string;
        };
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
        creator: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        responsible: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        companyId: string;
        responsibleId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        estimatedStartDate: Date;
        estimatedEndDate: Date;
        priority: import(".prisma/client").$Enums.ActionPriority;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        creatorId: string;
        blockedReason: string | null;
        isBlocked: boolean;
        isLate: boolean;
    })[]>;
    findOne(userId: string, userRole: UserRole, id: string): Promise<{
        company: {
            users: {
                plan: import(".prisma/client").$Enums.PlanType;
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                password: string;
                role: import(".prisma/client").$Enums.UserRole;
                maxCompanies: number;
                isActive: boolean;
                deletedAt: Date | null;
                managerId: string | null;
                maxActions: number;
                currentPlanId: string | null;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            email: string | null;
            deletedAt: Date | null;
            cnpj: string;
            address: string | null;
            phone: string | null;
            ownerId: string;
        };
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
        creator: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        responsible: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        companyId: string;
        responsibleId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        estimatedStartDate: Date;
        estimatedEndDate: Date;
        priority: import(".prisma/client").$Enums.ActionPriority;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        creatorId: string;
        blockedReason: string | null;
        isBlocked: boolean;
        isLate: boolean;
    }>;
    update(userId: string, userRole: UserRole, id: string, updateActionDto: UpdateActionDto): Promise<{
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            email: string | null;
            deletedAt: Date | null;
            cnpj: string;
            address: string | null;
            phone: string | null;
            ownerId: string;
        };
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
        creator: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        responsible: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        companyId: string;
        responsibleId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        estimatedStartDate: Date;
        estimatedEndDate: Date;
        priority: import(".prisma/client").$Enums.ActionPriority;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        creatorId: string;
        blockedReason: string | null;
        isBlocked: boolean;
        isLate: boolean;
    }>;
    moveAction(userId: string, userRole: UserRole, id: string, column: KanbanColumn, position: number): Promise<{
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            email: string | null;
            deletedAt: Date | null;
            cnpj: string;
            address: string | null;
            phone: string | null;
            ownerId: string;
        };
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
        creator: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        responsible: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string;
        companyId: string;
        responsibleId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        estimatedStartDate: Date;
        estimatedEndDate: Date;
        priority: import(".prisma/client").$Enums.ActionPriority;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        creatorId: string;
        blockedReason: string | null;
        isBlocked: boolean;
        isLate: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
