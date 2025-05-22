"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAdmin(createAdminUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createAdminUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Já existe um usuário com este email');
        }
        const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);
        return this.prisma.user.create({
            data: {
                name: createAdminUserDto.name,
                email: createAdminUserDto.email,
                password: hashedPassword,
                role: 'ADMIN',
                plan: 'FREE',
                maxCompanies: 1,
                maxActions: 30,
            },
        });
    }
    async createMaster(createMasterUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createMasterUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Já existe um usuário com este email');
        }
        const existingCompany = await this.prisma.company.findUnique({
            where: { cnpj: createMasterUserDto.company.cnpj },
        });
        if (existingCompany) {
            throw new common_1.ConflictException('Já existe uma empresa com este CNPJ');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: createMasterUserDto.planId },
            select: {
                id: true,
                type: true
            }
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        const hashedPassword = await bcrypt.hash(createMasterUserDto.password, 10);
        return this.prisma.$transaction(async (prisma) => {
            const masterUser = await prisma.user.create({
                data: {
                    name: createMasterUserDto.name,
                    email: createMasterUserDto.email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    plan: plan.type,
                    maxCompanies: 999999,
                    maxActions: 999999,
                    currentPlanId: plan.id
                }
            });
            const company = await prisma.company.create({
                data: {
                    name: createMasterUserDto.company.name,
                    cnpj: createMasterUserDto.company.cnpj,
                    address: createMasterUserDto.company.address,
                    phone: createMasterUserDto.company.phone,
                    email: createMasterUserDto.company.email,
                    planId: plan.id,
                    ownerId: masterUser.id,
                    users: {
                        connect: { id: masterUser.id }
                    }
                }
            });
            await prisma.user.update({
                where: { id: masterUser.id },
                data: {
                    companies: {
                        connect: { id: company.id }
                    }
                }
            });
            return {
                user: masterUser,
                company,
                plan
            };
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map