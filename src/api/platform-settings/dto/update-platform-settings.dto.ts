import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @ApiPropertyOptional({
    description:
      'Número WhatsApp em formato E.164 (+55...) ou formato brasileiro',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+55\d{10,11}|\d{10,11})$/, {
    message:
      'Número WhatsApp deve estar no formato brasileiro (10 ou 11 dígitos) ou E.164 (+55...)',
  })
  supportWhatsapp?: string;

  @ApiPropertyOptional({ description: 'Email de suporte' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  supportEmail?: string;
}
