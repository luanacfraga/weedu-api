import { ActionPriority, ActionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class ChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}

export class CreateActionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsUUID()
  @IsNotEmpty()
  responsibleId: string;

  @IsEnum(ActionStatus)
  @IsOptional()
  status?: ActionStatus;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  estimatedStartDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  estimatedEndDate: Date;

  @IsEnum(ActionPriority)
  @IsOptional()
  priority?: ActionPriority;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklistItems?: ChecklistItemDto[];
} 