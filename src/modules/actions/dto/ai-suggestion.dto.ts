import { ActionPriority } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class ChecklistItemSuggestionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ActionPriority)
  @IsNotEmpty()
  priority: ActionPriority;
}

export class AISuggestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemSuggestionDto)
  checklistItems: ChecklistItemSuggestionDto[];
} 
 