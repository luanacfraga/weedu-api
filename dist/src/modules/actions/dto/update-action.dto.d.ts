import { ActionPriority, ActionStatus } from '@prisma/client';
export declare class UpdateChecklistItemDto {
    description: string;
    priority?: ActionPriority;
}
export declare class UpdateActionDto {
    title?: string;
    description?: string;
    responsibleId?: string;
    status?: ActionStatus;
    estimatedStartDate?: Date;
    estimatedEndDate?: Date;
    priority?: ActionPriority;
    checklistItems?: UpdateChecklistItemDto[];
}
