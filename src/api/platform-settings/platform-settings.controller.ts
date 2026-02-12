import { Roles } from '@/api/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/api/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/api/auth/guards/roles.guard';
import { UserRole } from '@/core/domain/shared/enums';
import type { PlatformSettingsRepository } from '@/core/ports/repositories/platform-settings.repository';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlatformSettingsResponseDto } from './dto/platform-settings-response.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';

@ApiTags('platform-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/platform-settings')
export class PlatformSettingsController {
  constructor(
    @Inject('PlatformSettingsRepository')
    private readonly repo: PlatformSettingsRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna as configurações da plataforma (contato de suporte)',
  })
  async get(): Promise<PlatformSettingsResponseDto> {
    const settings = await this.repo.get();
    return {
      supportWhatsapp: settings?.supportWhatsapp ?? null,
      supportEmail: settings?.supportEmail ?? null,
    };
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MASTER)
  @ApiOperation({
    summary: 'Atualiza as configurações da plataforma (apenas MASTER)',
  })
  async update(
    @Body() body: UpdatePlatformSettingsDto,
  ): Promise<PlatformSettingsResponseDto> {
    const updated = await this.repo.upsert({
      supportWhatsapp: body.supportWhatsapp,
      supportEmail: body.supportEmail,
    });
    return {
      supportWhatsapp: updated.supportWhatsapp,
      supportEmail: updated.supportEmail,
    };
  }
}
