import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ProductivityMetricsDto } from '../dto/productivity-metrics.dto';
export declare class ProductivityMetricsService {
    private prisma;
    constructor(prisma: PrismaService);
    getProductivityMetrics(userId: string, companyId: string, dto: ProductivityMetricsDto): Promise<{
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
    private calculateCompletedByPeriod;
    private calculateAverageCompletionTime;
    private calculateOnTimeCompletionRate;
    private calculateOnTimeVsLate;
    private getWeekNumber;
}
