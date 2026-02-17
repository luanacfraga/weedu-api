import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { PlatformSettingsController } from './platform-settings.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PlatformSettingsController],
})
export class PlatformSettingsModule {}
