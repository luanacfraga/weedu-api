export declare enum PeriodType {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"
}
export declare class ProductivityMetricsDto {
    periodType: PeriodType;
    startDate: Date;
    endDate: Date;
    referenceDate?: Date;
}
