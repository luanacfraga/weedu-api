import { PlanType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePlanDto {
  @IsEnum(PlanType)
  plan: PlanType;
}
