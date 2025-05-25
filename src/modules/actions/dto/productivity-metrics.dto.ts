import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class ProductivityMetricsDto {
  @IsEnum(PeriodType)
  @IsNotEmpty()
  periodType: PeriodType;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  referenceDate?: Date;
} 