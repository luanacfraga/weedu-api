import { ActionPriority, ActionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class UpdateChecklistItemDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean;

  @IsInt()
  @IsNotEmpty()
  order: number;
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

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  actualStartDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  actualEndDate?: Date;

  @IsEnum(ActionPriority)
  @IsOptional()
  priority?: ActionPriority;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChecklistItemDto)
  checklistItems?: UpdateChecklistItemDto[];
} 