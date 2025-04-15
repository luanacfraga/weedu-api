import { IBaseRepository } from '@core/abstracts/base.repository';
import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let jwtService: JwtService;
  let userRepository: IBaseRepository<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: 'IBaseRepository',
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get('IBaseRepository');
  });

  it('should be defined', () => {
    expect(loginUseCase).toBeDefined();
  });

  it('should return tokens when credentials are valid', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 10);

    userRepository.findOne.mockResolvedValue({
      id: faker.string.uuid(),
      email,
      password: hashedPassword,
    });

    const result = await loginUseCase.execute(email, password);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      loginUseCase.execute(faker.internet.email(), faker.internet.password()),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    userRepository.findOne.mockResolvedValue({
      id: faker.string.uuid(),
      email,
      password: await bcrypt.hash('different-password', 10),
    });

    await expect(loginUseCase.execute(email, password)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
