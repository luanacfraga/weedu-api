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
exports.CompaniesService = void 0;
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let CompaniesService = class CompaniesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCompany(createCompanyDto, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                currentPlan: true
            }
        });
        if (!user || user.role !== 'MASTER') {
            throw new common_1.ForbiddenException('Apenas usuários MASTER podem criar empresas');
        }
        const existingCompany = await this.prisma.company.findUnique({
            where: { cnpj: createCompanyDto.cnpj },
        });
        if (existingCompany) {
            throw new common_1.ConflictException('Já existe uma empresa com este CNPJ');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: createCompanyDto.planId },
            include: {
                limits: true
            }
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        const company = await this.prisma.company.create({
            data: {
                name: createCompanyDto.name,
                cnpj: createCompanyDto.cnpj,
                address: createCompanyDto.address,
                phone: createCompanyDto.phone,
                email: createCompanyDto.email,
                plan: {
                    connect: { id: plan.id }
                },
                owner: {
                    connect: { id: userId }
                },
                users: {
                    connect: { id: userId }
                }
            },
            include: {
                plan: {
                    include: {
                        limits: true
                    }
                }
            }
        });
        return company;
    }
    async findManagers(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: {
                users: {
                    where: {
                        role: client_1.UserRole.MANAGER,
                        isActive: true,
                        deletedAt: null,
                    },
                    include: {
                        managedUsers: {
                            where: {
                                isActive: true,
                                deletedAt: null,
                            },
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
        if (!company) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        return company.users;
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map