import { CompanyService } from '../../application/services/company.service';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
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
    updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<{
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
    findMyCompanies(req: any): Promise<{
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
    addCompany(req: any, createCompanyDto: CreateCompanyDto): Promise<{
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
    findMyCompaniesForSelect(req: any): Promise<{
        name: string;
        cnpj: string;
        id: string;
    }[]>;
    findManagers(id: string): Promise<{
        name: string;
        id: string;
    }[]>;
}
