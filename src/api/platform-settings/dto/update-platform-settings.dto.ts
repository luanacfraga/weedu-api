import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @ApiPropertyOptional({
    description: 'Número WhatsApp em formato E.164 (+55...)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'Número WhatsApp deve estar no formato E.164',
  })
  supportWhatsapp?: string;

  @ApiPropertyOptional({ description: 'Email de suporte' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  supportEmail?: string;
}
