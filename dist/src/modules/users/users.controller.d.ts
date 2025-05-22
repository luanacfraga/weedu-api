import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateMasterUserDto } from './dto/create-master-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createAdmin(createAdminUserDto: CreateAdminUserDto): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
    createMaster(createMasterUserDto: CreateMasterUserDto): Promise<{
        user: {
            id: string;
            email: string;
            password: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            plan: import(".prisma/client").$Enums.PlanType;
            maxCompanies: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        company: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            cnpj: string;
            address: string | null;
            phone: string | null;
            planId: string;
            ownerId: string;
        };
        plan: {
            id: string;
            type: import(".prisma/client").$Enums.PlanType;
        };
    }>;
}
