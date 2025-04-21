import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { FindManagerUsersDto } from '../dtos/find-manager-users.dto';
import { FindUsersDto } from '../dtos/find-users.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
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
    findAllByCompany(companyId: string, findUsersDto: FindUsersDto): Promise<{
        data: Record<string, any>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAllByManager(managerId: string, findManagerUsersDto: FindManagerUsersDto): Promise<{
        data: Record<string, any>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<{
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
    deactivateUser(id: string): Promise<{
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
    activateUser(id: string): Promise<{
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
    private getCurrentUser;
}
