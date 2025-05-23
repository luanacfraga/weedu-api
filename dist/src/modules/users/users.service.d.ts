import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { CreateMasterUserDto } from './dto/create-master-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createAdmin(createAdminDto: CreateAdminDto): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
    createMaster(createMasterUserDto: CreateMasterUserDto): Promise<{
        user: {
            plan: import(".prisma/client").$Enums.PlanType;
            id: string;
            name: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            maxCompanies: number;
            isActive: boolean;
            managerId: string | null;
            maxActions: number;
            currentPlanId: string | null;
        };
        company: {
            id: string;
            name: string;
            cnpj: string;
            address: string | null;
            phone: string | null;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            planId: string;
            ownerId: string;
        };
        plan: {
            limits: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                planId: string;
                limit: number;
                feature: import(".prisma/client").$Enums.PlanFeature;
            }[];
        } & {
            description: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PlanType;
            price: number;
            features: import(".prisma/client").$Enums.PlanFeature[];
        };
    }>;
    createManager(createManagerDto: CreateManagerDto, currentUser: any): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
    createCollaborator(createCollaboratorDto: CreateCollaboratorDto, currentUser: any): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
    getManagerTeam(managerId: string, currentUser: any): Promise<{
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        companies: {
            id: string;
            name: string;
        }[];
    }[]>;
}
