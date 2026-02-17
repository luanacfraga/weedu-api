import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationPreference } from '@/core/domain/shared/enums';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Tooldo Tecnologia Atualizada',
    required: false,
  })
  @IsString({ message: 'O nome da empresa deve ser uma string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descrição da empresa',
    example: 'Empresa de tecnologia focada em educação',
    required: false,
  })
  @IsString({ message: 'A descrição da empresa deve ser uma string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Preferência de canal de notificação da empresa',
    enum: NotificationPreference,
    example: NotificationPreference.BOTH,
    required: false,
  })
  @IsEnum(NotificationPreference, {
    message: 'notificationPreference deve ser sms_only, whatsapp_only ou both',
  })
  @IsOptional()
  notificationPreference?: NotificationPreference;
}
