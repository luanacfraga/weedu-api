import { ActionPriority } from '@prisma/client';
export declare class ChecklistItemSuggestionDto {
    description: string;
    priority: ActionPriority;
}
export declare class AISuggestionDto {
    title: string;
    description: string;
    checklistItems: ChecklistItemSuggestionDto[];
}
