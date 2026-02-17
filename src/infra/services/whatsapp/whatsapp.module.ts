import { Module } from '@nestjs/common';

import { TwilioModule } from '../twilio/twilio.module';
import { TwilioWhatsappServiceImpl } from './twilio/twilio-whatsapp.service';

@Module({
  imports: [TwilioModule],
  providers: [
    {
      provide: 'WhatsappService',
      useClass: TwilioWhatsappServiceImpl,
    },
  ],
  exports: ['WhatsappService'],
})
export class WhatsappModule {}
