import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
