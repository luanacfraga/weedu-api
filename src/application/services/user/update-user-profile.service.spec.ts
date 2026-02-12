import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserProfileService } from './update-user-profile.service';

describe('UpdateUserProfileService — email change', () => {
  const mockUser = {
    id: 'user-1',
    password: 'hashed-password',
    email: 'old@example.com',
  };

  const makeService = (overrides?: {
    findById?: jest.Mock;
    findByEmail?: jest.Mock;
    findByPhone?: jest.Mock;
    compare?: jest.Mock;
  }) => {
    const userRepository = {
      findById: overrides?.findById ?? jest.fn().mockResolvedValue(mockUser),
      findByEmail: overrides?.findByEmail ?? jest.fn().mockResolvedValue(null),
      findByPhone: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockImplementation((_id, data) => ({ ...mockUser, ...data })),
    };
    const passwordHasher = {
      compare: overrides?.compare ?? jest.fn().mockResolvedValue(true),
      hash: jest.fn(),
    };
    return new UpdateUserProfileService(userRepository as any, passwordHasher as any);
  };

  it('throws BadRequestException when email provided without currentPassword', async () => {
    const svc = makeService();
    await expect(
      svc.execute({ userId: 'user-1', email: 'new@example.com' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when email provided with empty currentPassword', async () => {
    const svc = makeService();
    await expect(
      svc.execute({ userId: 'user-1', email: 'new@example.com', currentPassword: '' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when user not found', async () => {
    const svc = makeService({ findById: jest.fn().mockResolvedValue(null) });
    await expect(
      svc.execute({ userId: 'user-1', email: 'new@example.com', currentPassword: 'pass' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws UnauthorizedException when password is wrong', async () => {
    const svc = makeService({ compare: jest.fn().mockResolvedValue(false) });
    await expect(
      svc.execute({ userId: 'user-1', email: 'new@example.com', currentPassword: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws ConflictException when email is taken by another user', async () => {
    const svc = makeService({
      findByEmail: jest.fn().mockResolvedValue({ id: 'other-user', email: 'new@example.com' }),
    });
    await expect(
      svc.execute({ userId: 'user-1', email: 'new@example.com', currentPassword: 'pass' }),
    ).rejects.toThrow(ConflictException);
  });

  it('does not throw ConflictException when email belongs to the same user', async () => {
    const svc = makeService({
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'same@example.com' }),
    });
    await expect(
      svc.execute({ userId: 'user-1', email: 'same@example.com', currentPassword: 'pass' }),
    ).resolves.toBeDefined();
  });

  it('updates email when all validations pass', async () => {
    const svc = makeService();
    const result = await svc.execute({
      userId: 'user-1',
      email: 'new@example.com',
      currentPassword: 'correct',
    });
    expect(result).toBeDefined();
  });
});
