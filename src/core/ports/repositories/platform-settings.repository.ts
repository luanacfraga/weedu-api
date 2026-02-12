import { PlatformSettings } from '@/core/domain/platform-settings/platform-settings.entity';

export interface PlatformSettingsRepository {
  get(): Promise<PlatformSettings | null>;
  upsert(data: {
    supportWhatsapp?: string | null;
    supportEmail?: string | null;
  }): Promise<PlatformSettings>;
}
