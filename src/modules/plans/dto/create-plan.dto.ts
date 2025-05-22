import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';

enum PlanFeature {
  ACTIONS = 'ACTIONS',
  COLLABORATORS = 'COLLABORATORS',
  MANAGERS = 'MANAGERS',
  AI_SUGGESTIONS = 'AI_SUGGESTIONS'
}

enum PlanType {
  FREE = 'FREE',
  PAID = 'PAID'
}

class PlanLimitDto {
  @IsEnum(PlanFeature)
  feature: PlanFeature;

  @IsNumber()
  limit: number;
}

export class CreatePlanDto {
  @IsEnum(PlanType)
  type: PlanType;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsArray()
  @IsEnum(PlanFeature, { each: true })
  features: PlanFeature[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanLimitDto)
  limits: PlanLimitDto[];
} 