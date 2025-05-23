import { ActionPriority, ActionStatus } from '@prisma/client';
export declare class ChecklistItemDto {
    description: string;
}
export declare class CreateActionDto {
    title: string;
    description: string;
    companyId: string;
    responsibleId: string;
    status?: ActionStatus;
    estimatedStartDate: Date;
    estimatedEndDate: Date;
    priority?: ActionPriority;
    checklistItems?: ChecklistItemDto[];
}
