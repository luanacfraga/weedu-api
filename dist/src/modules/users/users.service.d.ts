import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createAdmin(createAdminUserDto: CreateAdminUserDto): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        email: string;
        password: string;
        id: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        maxCompanies: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        managerId: string | null;
        maxActions: number;
        currentPlanId: string | null;
    }>;
}
