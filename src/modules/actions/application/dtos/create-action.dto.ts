import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsString()
  @IsNotEmpty()
  actionPlan: string;

  @IsString()
  @IsNotEmpty()
  why?: string;

  @IsString()
  @IsNotEmpty()
  observation?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsUUID()
  @IsNotEmpty()
  managerId: string;

  @IsUUID()
  @IsNotEmpty()
  creatorId: string;
}
