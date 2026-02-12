import { ApiProperty } from '@nestjs/swagger';

export class PlatformSettingsResponseDto {
  @ApiProperty({ required: false, nullable: true })
  supportWhatsapp!: string | null;

  @ApiProperty({ required: false, nullable: true })
  supportEmail!: string | null;
}
