import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    create(createCompanyDto: CreateCompanyDto, req: any): Promise<{
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
}
