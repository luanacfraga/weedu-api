import { ActionApplicationModule } from '@/application/modules/action.module';
import { OverdueActionNotificationCron } from '@/application/services/notification/overdue-action-notification.cron';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, ActionApplicationModule],
  providers: [OverdueActionNotificationCron],
})
export class SchedulerModule {}
