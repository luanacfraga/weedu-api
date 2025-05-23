import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesService {
    private prisma;
    constructor(prisma: PrismaService);
    createCompany(createCompanyDto: CreateCompanyDto, userId: string): Promise<{
        plan: {
            limits: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                planId: string;
                feature: import(".prisma/client").$Enums.PlanFeature;
                limit: number;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PlanType;
            description: string;
            price: number;
            features: import(".prisma/client").$Enums.PlanFeature[];
        };
    } & {
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
    }>;
    findManagers(companyId: string): Promise<({
        managedUsers: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        plan: import(".prisma/client").$Enums.PlanType;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    })[]>;
}
