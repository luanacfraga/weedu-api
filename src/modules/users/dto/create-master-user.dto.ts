import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';

class CompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  address?: string;

  @IsString()
  phone?: string;

  @IsEmail()
  email?: string;
}

export class CreateMasterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;

  @IsUUID()
  @IsNotEmpty()
  planId: string;
} 