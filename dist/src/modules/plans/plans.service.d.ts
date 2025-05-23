import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
interface Plan {
    id: string;
    type: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    createdAt: Date;
    updatedAt: Date;
    limits: {
        id: string;
        feature: string;
        limit: number;
    }[];
}
export declare class PlansService {
    private prisma;
    constructor(prisma: PrismaService);
    createPlan(createPlanDto: CreatePlanDto, userId: string): Promise<Plan>;
    findAll(): Promise<Plan[]>;
    findOne(id: string): Promise<Plan>;
}
export {};
