/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaService } from '@infrastructure/database/prisma.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { RegisterBusinessDto } from '../../presentation/dtos/register-business.dto';
import { RegisterUserDto } from '../../presentation/dtos/register-user.dto';
import { RegisterDto } from '../../presentation/dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = loginDto.password === user.password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password: _, companies, ...userWithoutPassword } = user;
    const companyId = companies.length > 0 ? companies[0].id : undefined;
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      companyId,
    );
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        ...userWithoutPassword,
        company:
          companies.length > 0
            ? {
                id: companies[0].id,
                name: companies[0].name,
              }
            : undefined,
      },
      ...tokens,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    companyId?: string,
  ) {
    const payload = { sub: userId, email, role };
    if (companyId) {
      payload['companyId'] = companyId;
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async registerBusiness(registerBusinessDto: RegisterBusinessDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerBusinessDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: registerBusinessDto.cnpj },
    });

    if (existingCompany) {
      throw new BadRequestException('CNPJ já cadastrado');
    }

    const hashedPassword = await hash(registerBusinessDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerBusinessDto.name,
        email: registerBusinessDto.email,
        password: hashedPassword,
        role: 'CONSULTANT',
        plan: 'FREE',
        maxCompanies: 1,
      },
    });

    const company = await this.prisma.company.create({
      data: {
        name: registerBusinessDto.companyName,
        cnpj: registerBusinessDto.cnpj,
        address: registerBusinessDto.address,
        phone: registerBusinessDto.phone,
        email: registerBusinessDto.email,
        plan: 'FREE',
        users: {
          connect: {
            id: user.id,
          },
        },
        consultants: {
          create: {
            consultantId: user.id,
          },
        },
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        maxCompanies: user.maxCompanies,
      },
      company: {
        id: company.id,
        name: company.name,
        cnpj: company.cnpj,
        plan: company.plan,
      },
    };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: registerUserDto.companyId },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    if (registerUserDto.role === 'COLLABORATOR') {
      const manager = await this.prisma.user.findUnique({
        where: { id: registerUserDto.managerId },
        include: { companies: true },
      });

      if (!manager) {
        throw new BadRequestException('Gestor não encontrado');
      }

      if (manager.role !== 'MANAGER') {
        throw new BadRequestException('O usuário indicado não é um gestor');
      }

      const managerBelongsToCompany = manager.companies.some(
        (c) => c.id === registerUserDto.companyId,
      );

      if (!managerBelongsToCompany) {
        throw new BadRequestException('O gestor não pertence à mesma empresa');
      }
    }

    const hashedPassword = await hash(registerUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerUserDto.name,
        email: registerUserDto.email,
        password: hashedPassword,
        role: registerUserDto.role,
        companies: {
          connect: {
            id: registerUserDto.companyId,
          },
        },
        ...(registerUserDto.role === 'COLLABORATOR' && {
          manager: {
            connect: {
              id: registerUserDto.managerId,
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const companyId = user.companies[0].id;
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      companyId,
    );
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: {
          id: user.companies[0].id,
          name: user.companies[0].name,
        },
      },
      ...tokens,
    };
  }
}
