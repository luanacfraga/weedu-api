import type { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { NotificationPreference } from '@/core/domain/shared/enums';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export interface UpdateUserProfileInput {
  userId: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  notificationPreference?: NotificationPreference;
  email?: string;
  currentPassword?: string;
}

@Injectable()
export class UpdateUserProfileService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: UpdateUserProfileInput): Promise<User> {
    const updateData: Record<string, unknown> = {};

    if (typeof input.phone === 'string') {
      const existing = await this.userRepository.findByPhone(input.phone);
      if (existing && existing.id !== input.userId) {
        throw new ConflictException('Este telefone já está em uso por outro usuário.');
      }
      updateData.phone = input.phone;
    }

    if (typeof input.firstName === 'string') {
      updateData.firstName = input.firstName;
    }

    if (typeof input.lastName === 'string') {
      updateData.lastName = input.lastName;
    }

    if (input.notificationPreference !== undefined) {
      updateData.notificationPreference = input.notificationPreference;
    }

    if (typeof input.email === 'string') {
      if (typeof input.currentPassword !== 'string' || input.currentPassword.length === 0) {
        throw new BadRequestException(
          'A senha atual é obrigatória para alterar o email.',
        );
      }

      const currentUser = await this.userRepository.findById(input.userId);
      if (!currentUser) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const passwordValid = await this.passwordHasher.compare(
        input.currentPassword,
        currentUser.password,
      );
      if (!passwordValid) {
        throw new UnauthorizedException('Senha atual incorreta.');
      }

      const existing = await this.userRepository.findByEmail(input.email);
      if (existing && existing.id !== input.userId) {
        throw new ConflictException(
          'Este email já está em uso por outro usuário.',
        );
      }

      updateData.email = input.email;
    }

    return this.userRepository.update(
      input.userId,
      updateData as Partial<User>,
    );
  }
}
