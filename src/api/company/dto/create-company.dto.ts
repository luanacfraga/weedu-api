import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationPreference } from '@/core/domain/shared/enums';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'ID do administrador que está criando a empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'O adminId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O adminId é obrigatório' })
  adminId!: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Tooldo Tecnologia',
  })
  @IsString({ message: 'O nome da empresa deve ser uma string' })
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório' })
  name!: string;

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
