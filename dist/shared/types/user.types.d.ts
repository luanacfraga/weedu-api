export type UserRole = 'ADMIN' | 'CONSULTANT' | 'MANAGER' | 'COLLABORATOR';
export interface AuthenticatedUser {
    id: string;
    role: UserRole;
}
