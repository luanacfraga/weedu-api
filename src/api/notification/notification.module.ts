import { SchedulerModule } from '@/application/modules/scheduler.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';

@Module({
  imports: [SchedulerModule, DatabaseModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
