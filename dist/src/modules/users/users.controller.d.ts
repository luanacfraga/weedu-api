import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { CreateMasterUserDto } from './dto/create-master-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createAdmin(createAdminDto: CreateAdminDto): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        deletedAt: Date | null;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
    createMaster(createMasterUserDto: CreateMasterUserDto): Promise<{
        user: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            deletedAt: Date | null;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            email: string | null;
            deletedAt: Date | null;
            cnpj: string;
            address: string | null;
            phone: string | null;
            ownerId: string;
        };
        plan: {
            limits: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                feature: import(".prisma/client").$Enums.PlanFeature;
                limit: number;
                planId: string;
            }[];
        } & {
            id: string;
            type: import(".prisma/client").$Enums.PlanType;
            name: string;
            description: string;
            price: number;
            features: import(".prisma/client").$Enums.PlanFeature[];
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    createManager(createManagerDto: CreateManagerDto, req: any): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        deletedAt: Date | null;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
    createCollaborator(createCollaboratorDto: CreateCollaboratorDto, req: any): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        deletedAt: Date | null;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
    getManagerTeam(id: string, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        companies: {
            id: string;
            name: string;
        }[];
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
}
