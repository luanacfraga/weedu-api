import { PrismaService } from '@infrastructure/database/prisma.service';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class ManagerCompanyGuard implements CanActivate {
    private reflector;
    private prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
