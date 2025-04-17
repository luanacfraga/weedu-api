import { CompanyService } from '../../application/services/company.service';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    register(createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        plan: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        cnpj: string;
        address: string | null;
        phone: string | null;
        actionCount: number;
        maxActions: number;
    }>;
    create(createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        plan: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        cnpj: string;
        address: string | null;
        phone: string | null;
        actionCount: number;
        maxActions: number;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        cnpj: string;
        address: string;
        phone: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        cnpj: string;
        address: string;
        phone: string;
        users: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        consultants: {
            consultant: {
                id: string;
                email: string;
                name: string;
            };
        }[];
    }>;
    updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        plan: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        cnpj: string;
        address: string | null;
        phone: string | null;
        actionCount: number;
        maxActions: number;
    }>;
    findMyCompanies(req: any): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        companies: {
            id: string;
            email: string;
            name: string;
            plan: import(".prisma/client").$Enums.PlanType;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string;
            address: string;
            phone: string;
            actionCount: number;
            maxActions: number;
        }[];
    }>;
    addCompany(req: any, createCompanyDto: CreateCompanyDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        plan: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        cnpj: string;
        address: string | null;
        phone: string | null;
        actionCount: number;
        maxActions: number;
    }>;
}
