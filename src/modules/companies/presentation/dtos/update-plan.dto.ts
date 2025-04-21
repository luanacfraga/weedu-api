import { IsEnum } from 'class-validator';
import { PlanType } from '../../application/dtos/plan-type';

export class UpdatePlanDto {
  @IsEnum(PlanType)
  plan: PlanType;
}
