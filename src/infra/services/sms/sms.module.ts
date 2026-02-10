import { Module } from '@nestjs/common';

import { TwilioModule } from '../twilio/twilio.module';
import { TwilioSmsServiceImpl } from './twilio/twilio-sms.service';

@Module({
  imports: [TwilioModule],
  providers: [
    {
      provide: 'SmsService',
      useClass: TwilioSmsServiceImpl,
    },
  ],
  exports: ['SmsService'],
})
export class SmsModule {}
