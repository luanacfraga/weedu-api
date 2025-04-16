import { CompanyService } from '../../application/services/company.service';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
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
