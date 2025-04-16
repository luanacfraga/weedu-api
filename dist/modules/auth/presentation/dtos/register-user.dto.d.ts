import { UserRole } from '@prisma/client';
export declare class RegisterUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    companyId: string;
    managerId: string;
}
