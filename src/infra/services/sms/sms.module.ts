import { Module } from '@nestjs/common';

import { TwilioSmsServiceImpl } from './twilio/twilio-sms.service';

@Module({
  providers: [
    {
      provide: 'SmsService',
      useClass: TwilioSmsServiceImpl,
    },
  ],
  exports: ['SmsService'],
})
export class SmsModule {}
