import { ActionPriority } from '@prisma/client';
export declare class ChecklistItemSuggestionDto {
    description: string;
}
export declare class AISuggestionDto {
    title: string;
    description: string;
    priority: ActionPriority;
    checklistItems: ChecklistItemSuggestionDto[];
}
