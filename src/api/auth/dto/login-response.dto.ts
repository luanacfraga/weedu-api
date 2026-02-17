import { NotificationPreference } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '+5511999999999',
    required: false,
    nullable: true,
  })
  phone?: string | null;

  @ApiProperty()
  role!: string;

  @ApiProperty({
    description: 'Iniciais do usuário',
    example: 'JD',
    required: false,
    nullable: true,
  })
  initials?: string | null;

  @ApiProperty({
    description: 'Cor do avatar do usuário',
    example: '#FF5733',
    required: false,
    nullable: true,
  })
  avatarColor?: string | null;

  @ApiProperty({
    description: 'Preferência de notificação',
    enum: NotificationPreference,
    example: NotificationPreference.BOTH,
    required: false,
  })
  notificationPreference?: NotificationPreference;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token!: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: LoginUserDto,
  })
  user!: LoginUserDto;
}
