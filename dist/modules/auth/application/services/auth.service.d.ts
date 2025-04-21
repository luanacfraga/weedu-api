import { PrismaService } from '@infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { RegisterBusinessDto } from '../../presentation/dtos/register-business.dto';
import { RegisterUserDto } from '../../presentation/dtos/register-user.dto';
import { RegisterDto } from '../../presentation/dtos/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            company: {
                id: string;
                name: string;
            };
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
        };
    }>;
    private generateTokens;
    private saveRefreshToken;
    registerBusiness(registerBusinessDto: RegisterBusinessDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            plan: import(".prisma/client").$Enums.PlanType;
            maxCompanies: number;
        };
        company: {
            id: string;
            name: string;
            cnpj: string;
            plan: import(".prisma/client").$Enums.PlanType;
        };
    }>;
    registerUser(registerUserDto: RegisterUserDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            company: {
                id: string;
                name: string;
            };
        };
    }>;
}
