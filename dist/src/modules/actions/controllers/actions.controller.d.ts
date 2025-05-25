import { ActionsService } from '../actions.service';
export declare class ActionsController {
    private readonly actionsService;
    constructor(actionsService: ActionsService);
    getCompanyEmployees(req: any, companyId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        managerId: string;
    }[]>;
}
