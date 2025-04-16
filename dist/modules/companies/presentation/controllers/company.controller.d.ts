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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
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
    } | null>;
    updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<{
        id: string;
        name: string;
        cnpj: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
