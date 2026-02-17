import { ApiProperty } from '@nestjs/swagger';

class ManagerTeamTotalsDto {
  @ApiProperty() total!: number;
  @ApiProperty() todo!: number;
  @ApiProperty() inProgress!: number;
  @ApiProperty() done!: number;
  @ApiProperty() late!: number;
  @ApiProperty() blocked!: number;
}

class ManagerAttentionActionDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ enum: ['BLOCKED', 'LATE'] }) reason!: string;
  @ApiProperty({ nullable: true }) lateStatus!: string | null;
  @ApiProperty() isBlocked!: boolean;
  @ApiProperty() priority!: string;
  @ApiProperty({ nullable: true }) estimatedEndDate!: string | null;
}

class ManagerAttentionExecutorDto {
  @ApiProperty() userId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty({ nullable: true }) avatarColor!: string | null;
  @ApiProperty() criticalCount!: number;
  @ApiProperty({ type: [ManagerAttentionActionDto] })
  actions!: ManagerAttentionActionDto[];
}

export class ManagerDashboardResponseDto {
  @ApiProperty() companyId!: string;
  @ApiProperty() managerId!: string;
  @ApiProperty({ type: ManagerTeamTotalsDto }) teamTotals!: ManagerTeamTotalsDto;
  @ApiProperty({ type: [ManagerAttentionExecutorDto] })
  attentionItems!: ManagerAttentionExecutorDto[];
}
