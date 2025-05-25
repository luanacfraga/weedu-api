import { UserRole } from '@prisma/client';
import { ProductivityMetricsDto } from '../dto/productivity-metrics.dto';
import { ProductivityMetricsService } from '../services/productivity-metrics.service';
export declare class ProductivityMetricsController {
    private readonly productivityMetricsService;
    constructor(productivityMetricsService: ProductivityMetricsService);
    getProductivityMetrics(userId: string, userRole: UserRole, companyId: string, dto: ProductivityMetricsDto): Promise<{
        personal: {
            completedByPeriod: {};
            averageCompletionTime: number;
            onTimeCompletionRate: number;
            onTimeVsLate: {
                onTime: number;
                late: number;
                total: number;
            };
        };
        teamAverage: {
            averageCompletionTime: number;
            onTimeCompletionRate: number;
            onTimeVsLate: {
                onTime: number;
                late: number;
                total: number;
            };
        };
        comparison: {
            averageCompletionTime: string;
            onTimeCompletionRate: string;
        };
        statusSummary: Record<string, number>;
        lateCount: number;
    }>;
    getTeamMetrics(req: any, dto: ProductivityMetricsDto): Promise<{
        team: {
            id: string;
            name: string;
            metrics: {
                total: number;
                inProgress: number;
                completed: number;
                pending: number;
                late: number;
            };
        }[];
        teamTotal: {
            total: number;
            inProgress: number;
            completed: number;
            pending: number;
            late: number;
        };
    }>;
}
