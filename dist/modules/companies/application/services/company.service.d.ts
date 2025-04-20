import { PrismaService } from '@infrastructure/database/prisma.service';
import { CreateCompanyDto } from '../../presentation/dtos/create-company.dto';
import { PlanType } from '../dtos/plan-type';
export declare class CompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    private validateCNPJ;
    register(createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        plan: import(".prisma/client").$Enums.PlanType;
        actionCount: number;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    create(createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        plan: import(".prisma/client").$Enums.PlanType;
        actionCount: number;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string;
        phone: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string;
        phone: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        users: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        consultants: {
            consultant: {
                id: string;
                name: string;
                email: string;
            };
        }[];
    }>;
    updatePlan(id: string, plan: PlanType): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        plan: import(".prisma/client").$Enums.PlanType;
        actionCount: number;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
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
            id: string;
            name: string;
            cnpj: string;
            address: string;
            phone: string;
            email: string;
            plan: import(".prisma/client").$Enums.PlanType;
            actionCount: number;
            maxActions: number;
            createdAt: Date;
            updatedAt: Date;
            users: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
            }[];
        }[];
    }>;
    addCompanyToConsultant(consultantId: string, createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        plan: import(".prisma/client").$Enums.PlanType;
        actionCount: number;
        maxActions: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAllForSelect(): Promise<{
        id: string;
        name: string;
        cnpj: string;
    }[]>;
    findConsultantCompaniesForSelect(consultantId: string): Promise<{
        id: string;
        name: string;
        cnpj: string;
    }[]>;
}
