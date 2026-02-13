import { PlatformSettings } from '@/core/domain/platform-settings/platform-settings.entity';
import type { PlatformSettingsRepository } from '@/core/ports/repositories/platform-settings.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

const GLOBAL_ID = 'global';

@Injectable()
export class PlatformSettingsPrismaRepository
  implements PlatformSettingsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<PlatformSettings | null> {
    const row = await this.prisma.platformSettings.findUnique({
      where: { id: GLOBAL_ID },
    });
    if (!row) {
      return null;
    }
    return new PlatformSettings(row.id, row.supportWhatsapp, row.supportEmail);
  }

  async upsert(data: {
    supportWhatsapp?: string | null;
    supportEmail?: string | null;
  }): Promise<PlatformSettings> {
    // Normaliza o telefone para sempre ter +55 antes de salvar
    let normalizedWhatsapp: string | null = null;
    if (data.supportWhatsapp && data.supportWhatsapp.trim() !== '') {
      const digits = data.supportWhatsapp.replace(/\D/g, '');
      // Se já começa com 55, adiciona o +
      if (digits.startsWith('55') && digits.length >= 12) {
        normalizedWhatsapp = `+${digits}`;
      } else if (digits.length >= 10 && digits.length <= 11) {
        // Formato brasileiro (10 ou 11 dígitos), adiciona +55
        normalizedWhatsapp = `+55${digits}`;
      } else if (data.supportWhatsapp.startsWith('+55') && /^\+55\d{10,11}$/.test(data.supportWhatsapp)) {
        // Já está no formato E.164 correto
        normalizedWhatsapp = data.supportWhatsapp;
      }
    }

    const row = await this.prisma.platformSettings.upsert({
      where: { id: GLOBAL_ID },
      create: {
        id: GLOBAL_ID,
        supportWhatsapp: normalizedWhatsapp,
        supportEmail: data.supportEmail ?? null,
      },
      update: {
        ...(data.supportWhatsapp !== undefined && {
          supportWhatsapp: normalizedWhatsapp,
        }),
        ...(data.supportEmail !== undefined && {
          supportEmail: data.supportEmail,
        }),
      },
    });
    return new PlatformSettings(row.id, row.supportWhatsapp, row.supportEmail);
  }
}
