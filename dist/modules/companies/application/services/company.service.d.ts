import { PrismaService } from '@infrastructure/database/prisma.service';
import { CreateCompanyDto } from '../../presentation/dtos/create-company.dto';
import { PlanType } from '../dtos/plan-type';
export declare class CompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    private validateCNPJ;
    register(createCompanyDto: CreateCompanyDto): Promise<{
        email: string | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        actionCount: number;
    }>;
    create(createCompanyDto: CreateCompanyDto): Promise<{
        email: string | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        actionCount: number;
    }>;
    findAll(): Promise<{
        email: string;
        name: string;
        cnpj: string;
        address: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        name: string;
        cnpj: string;
        address: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        users: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
        }[];
        consultants: {
            consultant: {
                email: string;
                name: string;
                id: string;
            };
        }[];
    }>;
    updatePlan(id: string, plan: PlanType): Promise<{
        email: string | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        actionCount: number;
    }>;
    findConsultantCompanies(consultantId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        plan: import(".prisma/client").$Enums.PlanType;
        maxCompanies: number;
        companies: {
            managers: number;
            collaborators: number;
            email: string;
            name: string;
            cnpj: string;
            address: string;
            phone: string;
            id: string;
            plan: import(".prisma/client").$Enums.PlanType;
            maxActions: number;
            createdAt: Date;
            updatedAt: Date;
            actionCount: number;
            users: {
                role: import(".prisma/client").$Enums.UserRole;
                id: string;
            }[];
        }[];
    }>;
    addCompanyToConsultant(consultantId: string, createCompanyDto: CreateCompanyDto): Promise<{
        email: string | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        actionCount: number;
    }>;
    findAllForSelect(): Promise<{
        name: string;
        cnpj: string;
        id: string;
    }[]>;
    findConsultantCompaniesForSelect(consultantId: string): Promise<{
        name: string;
        cnpj: string;
        id: string;
    }[]>;
    findManagers(companyId: string): Promise<{
        name: string;
        id: string;
    }[]>;
}
