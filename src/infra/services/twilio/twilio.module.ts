import { Module } from '@nestjs/common';

import { TwilioConfig } from './twilio.config';

@Module({
  providers: [TwilioConfig],
  exports: [TwilioConfig],
})
export class TwilioModule {}
