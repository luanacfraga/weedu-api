import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
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
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    deactivateUser(id: string): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    activateUser(id: string): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    private getCurrentUser;
}
