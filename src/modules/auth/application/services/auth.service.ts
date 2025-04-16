import { PrismaService } from '@infrastructure/database/prisma.service';
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { RegisterDto } from '../../presentation/dtos/register.dto';
import { RegisterBusinessDto } from '../dtos/register-business.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

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

    const tokens = await this.generateTokens(user.id, user.email);
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
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('app.jwt.secret'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('app.jwt.secret'),
          expiresIn: '7d',
        },
      ),
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

    const hashedPassword = await bcrypt.hash(registerBusinessDto.password, 10);

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
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
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
}
