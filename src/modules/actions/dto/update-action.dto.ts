import { ActionPriority, ActionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class UpdateChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ActionPriority)
  @IsOptional()
  priority?: ActionPriority;
}

export class UpdateActionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  responsibleId?: string;

  @IsEnum(ActionStatus)
  @IsOptional()
  status?: ActionStatus;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  estimatedStartDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  estimatedEndDate?: Date;

  @IsEnum(ActionPriority)
  @IsOptional()
  priority?: ActionPriority;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChecklistItemDto)
  checklistItems?: UpdateChecklistItemDto[];
} 