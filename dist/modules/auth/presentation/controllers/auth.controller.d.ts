import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterBusinessDto } from '../dtos/register-business.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { RegisterDto } from '../dtos/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    registerBusiness(registerBusinessDto: RegisterBusinessDto): Promise<{
        access_token: string;
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
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
}
