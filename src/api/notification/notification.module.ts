import { SchedulerModule } from '@/application/modules/scheduler.module';
import { SendTestTwilioNotificationService } from '@/application/services/notification/send-test-twilio-notification.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SmsModule } from '@/infra/services/sms/sms.module';
import { WhatsappModule } from '@/infra/services/whatsapp/whatsapp.module';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';

@Module({
  imports: [SchedulerModule, DatabaseModule, SmsModule, WhatsappModule],
  controllers: [NotificationController],
  providers: [SendTestTwilioNotificationService],
})
export class NotificationModule {}
