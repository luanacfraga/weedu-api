export declare enum ActionStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
export declare enum ActionPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum UserRole {
    MASTER = "MASTER",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    COLLABORATOR = "COLLABORATOR"
}
export declare enum KanbanColumn {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
export interface ChecklistItem {
    id: string;
    description: string;
    isCompleted: boolean;
    completedAt: Date | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    actionId: string;
}
export interface KanbanOrder {
    id: string;
    column: KanbanColumn;
    position: number;
    sortOrder: number;
    lastMovedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    actionId: string;
}
export interface Company {
    id: string;
    name: string;
    cnpj: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    planId: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    plan: string;
    maxCompanies: number;
    isActive: boolean;
    managerId: string | null;
    maxActions: number;
    currentPlanId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface Action {
    id: string;
    title: string;
    description: string;
    actualStartDate: Date | null;
    actualEndDate: Date | null;
    status: ActionStatus;
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
    priority: ActionPriority;
    responsibleId: string;
    company: Company;
    creator: User;
    responsible: User;
    kanbanOrder: KanbanOrder | null;
    checklistItems: ChecklistItem[];
}
export interface CreateActionDto {
    title: string;
    description: string;
    companyId: string;
    responsibleId: string;
    status?: ActionStatus;
    estimatedStartDate: Date;
    estimatedEndDate: Date;
    priority?: ActionPriority;
    checklistItems?: {
        description: string;
    }[];
}
export interface UpdateActionDto {
    title?: string;
    description?: string;
    responsibleId?: string;
    status?: ActionStatus;
    estimatedStartDate?: Date;
    estimatedEndDate?: Date;
    priority?: ActionPriority;
    checklistItems?: {
        description: string;
    }[];
}
export interface GetActionsParams {
    companyId: string;
    responsibleId?: string;
    status?: ActionStatus;
}
