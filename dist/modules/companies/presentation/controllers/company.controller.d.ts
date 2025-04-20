import { CompanyService } from '../../application/services/company.service';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
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
    updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<{
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
    addCompany(req: any, createCompanyDto: CreateCompanyDto): Promise<{
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
    findMyCompaniesForSelect(req: any): Promise<{
        id: string;
        name: string;
        cnpj: string;
    }[]>;
}
