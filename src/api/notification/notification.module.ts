import { SchedulerModule } from '@/application/modules/scheduler.module';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';

@Module({
  imports: [SchedulerModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
