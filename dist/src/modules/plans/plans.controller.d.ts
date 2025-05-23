import { CreatePlanDto } from './dto/create-plan.dto';
import { PlansService } from './plans.service';
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
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    create(createPlanDto: CreatePlanDto, req: any): Promise<Plan>;
    findAll(): Promise<Plan[]>;
    findOne(id: string): Promise<Plan>;
}
export {};
