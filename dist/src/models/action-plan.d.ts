export interface User {
    id: string;
    name: string;
    role: 'master' | 'manager' | 'collaborator';
}
export interface Task {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: Date;
}
export interface ActionPlan {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    responsible: User;
    tasks: Task[];
    estimatedStartDate: Date;
    estimatedEndDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
    isBlocked: boolean;
    isLate: boolean;
    blockedReason?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: User;
}
