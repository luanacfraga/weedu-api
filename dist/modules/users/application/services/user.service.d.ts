import { PrismaService } from '@infrastructure/database/prisma.service';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateUser(userId: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    deactivateUser(userId: string, currentUser: any): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    activateUser(userId: string, currentUser: any): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    private canUpdateUser;
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAllByCompany(companyId: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
