import { NotificationPreference } from '@/core/domain/shared/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Novo primeiro nome' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Novo sobrenome' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Telefone em formato E.164 (+55...)' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Canal de notificação preferido',
    enum: NotificationPreference,
  })
  @IsOptional()
  @IsEnum(NotificationPreference, {
    message: 'notificationPreference deve ser sms_only, whatsapp_only ou both',
  })
  notificationPreference?: NotificationPreference;
}
