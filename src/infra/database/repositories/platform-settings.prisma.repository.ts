import { PlatformSettings } from '@/core/domain/platform-settings/platform-settings.entity';
import type { PlatformSettingsRepository } from '@/core/ports/repositories/platform-settings.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

const GLOBAL_ID = 'global';

@Injectable()
export class PlatformSettingsPrismaRepository implements PlatformSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<PlatformSettings | null> {
    const row = await this.prisma.platformSettings.findUnique({
      where: { id: GLOBAL_ID },
    });
    if (!row) return null;
    return new PlatformSettings(row.id, row.supportWhatsapp, row.supportEmail);
  }

  async upsert(data: {
    supportWhatsapp?: string | null;
    supportEmail?: string | null;
  }): Promise<PlatformSettings> {
    const row = await this.prisma.platformSettings.upsert({
      where: { id: GLOBAL_ID },
      create: {
        id: GLOBAL_ID,
        supportWhatsapp: data.supportWhatsapp ?? null,
        supportEmail: data.supportEmail ?? null,
      },
      update: {
        ...(data.supportWhatsapp !== undefined && { supportWhatsapp: data.supportWhatsapp }),
        ...(data.supportEmail !== undefined && { supportEmail: data.supportEmail }),
      },
    });
    return new PlatformSettings(row.id, row.supportWhatsapp, row.supportEmail);
  }
}
