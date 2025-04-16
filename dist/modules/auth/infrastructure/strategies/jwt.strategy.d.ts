import { PrismaService } from '@infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
    }>;
}
export {};
