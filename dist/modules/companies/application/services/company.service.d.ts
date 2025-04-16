import { PrismaService } from '@infrastructure/database/prisma.service';
import { CreateCompanyDto } from '../../presentation/dtos/create-company.dto';
import { UpdatePlanDto } from '../../presentation/dtos/update-plan.dto';
export declare class CompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    private validateCNPJ;
    register(createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        plan: import(".prisma/client").$Enums.PlanType;
        actionCount: number;
        maxActions: number;
    }>;
    create(createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        plan: import(".prisma/client").$Enums.PlanType;
        actionCount: number;
        maxActions: number;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
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
    } | null>;
    updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        plan: import(".prisma/client").$Enums.PlanType;
        actionCount: number;
        maxActions: number;
    }>;
}
