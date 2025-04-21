import { PrismaService } from '@infrastructure/database/prisma.service';
import { AuthenticatedUser } from '@shared/types/user.types';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { FindManagerUsersDto } from '../../presentation/dtos/find-manager-users.dto';
import { FindUsersDto } from '../../presentation/dtos/find-users.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateUser(userId: string, updateUserDto: UpdateUserDto, currentUser: AuthenticatedUser): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        managerId: string | null;
    }>;
    deactivateUser(userId: string, currentUser: AuthenticatedUser): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        managerId: string | null;
    }>;
    activateUser(userId: string, currentUser: AuthenticatedUser): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        managerId: string | null;
    }>;
    private canUpdateUser;
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        maxActions: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        managerId: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companies: {
            id: string;
            name: string;
        }[];
    }[]>;
    findAllByCompany(companyId: string, { page, limit }: FindUsersDto): Promise<{
        data: Record<string, any>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAllByManager(managerId: string, { page, limit }: FindManagerUsersDto): Promise<{
        data: Record<string, any>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
