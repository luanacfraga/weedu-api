import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAdmin(createAdminUserDto: CreateAdminUserDto) {
    // Verificar se já existe um usuário com este email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);

    // Criar o usuário admin
    return this.prisma.user.create({
      data: {
        name: createAdminUserDto.name,
        email: createAdminUserDto.email,
        password: hashedPassword,
        role: 'ADMIN',
        plan: 'FREE',
        maxCompanies: 1,
        maxActions: 30,
      },
    });
  }
} 