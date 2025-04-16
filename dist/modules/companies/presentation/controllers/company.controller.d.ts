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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        actionCount: number;
        maxActions: number;
    }>;
    create(createCompanyDto: CreateCompanyDto): Promise<{
        email: string | null;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        id: string;
        plan: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        actionCount: number;
        maxActions: number;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        actionCount: number;
        maxActions: number;
    }>;
}
