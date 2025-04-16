import { PrismaService } from '@infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { RegisterDto } from '../../presentation/dtos/register.dto';
import { RegisterBusinessDto } from '../dtos/register-business.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    private generateTokens;
    private saveRefreshToken;
    registerBusiness(registerBusinessDto: RegisterBusinessDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            plan: any;
            maxCompanies: any;
        };
        company: {
            id: string;
            name: string;
            cnpj: string;
            plan: any;
        };
    }>;
}
