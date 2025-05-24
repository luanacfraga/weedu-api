import { ActionPriority, ActionStatus } from '@prisma/client';
export declare class UpdateChecklistItemDto {
    id: string;
    description: string;
    isCompleted: boolean;
    order: number;
}
export declare class UpdateActionDto {
    title?: string;
    description?: string;
    responsibleId?: string;
    status?: ActionStatus;
    estimatedStartDate?: Date;
    estimatedEndDate?: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    priority?: ActionPriority;
    isBlocked?: boolean;
    checklistItems?: UpdateChecklistItemDto[];
}
