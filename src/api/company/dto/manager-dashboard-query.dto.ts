import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ManagerDashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Data inicial do período (ISO 8601)',
    example: '2026-01-27T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Data final do período (ISO 8601)',
    example: '2026-02-02T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
