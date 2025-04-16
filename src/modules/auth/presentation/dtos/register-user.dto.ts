import { UserRole } from '@prisma/client';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  companyId: string;
}
