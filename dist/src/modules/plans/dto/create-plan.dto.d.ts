declare enum PlanFeature {
    ACTIONS = "ACTIONS",
    COLLABORATORS = "COLLABORATORS",
    MANAGERS = "MANAGERS",
    AI_SUGGESTIONS = "AI_SUGGESTIONS"
}
declare enum PlanType {
    FREE = "FREE",
    PAID = "PAID"
}
declare class PlanLimitDto {
    feature: PlanFeature;
    limit: number;
}
export declare class CreatePlanDto {
    type: PlanType;
    name: string;
    description: string;
    price: number;
    features: PlanFeature[];
    limits: PlanLimitDto[];
}
export {};
