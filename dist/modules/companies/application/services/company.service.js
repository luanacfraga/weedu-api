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
exports.CompanyService = void 0;
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
let CompanyService = class CompanyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]/g, '');
        if (cnpj.length !== 14)
            return false;
        if (/^(\d)\1+$/.test(cnpj))
            return false;
        let sum = 0;
        let weight = 5;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj.charAt(i)) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }
        let digit = 11 - (sum % 11);
        if (digit > 9)
            digit = 0;
        if (digit !== parseInt(cnpj.charAt(12)))
            return false;
        sum = 0;
        weight = 6;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj.charAt(i)) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }
        digit = 11 - (sum % 11);
        if (digit > 9)
            digit = 0;
        if (digit !== parseInt(cnpj.charAt(13)))
            return false;
        return true;
    }
    async register(createCompanyDto) {
        if (!this.validateCNPJ(createCompanyDto.cnpj)) {
            throw new common_1.BadRequestException('CNPJ inválido');
        }
        const existingCompany = await this.prisma.company.findUnique({
            where: { cnpj: createCompanyDto.cnpj },
        });
        if (existingCompany) {
            throw new common_1.BadRequestException('CNPJ já cadastrado');
        }
        return this.prisma.company.create({
            data: {
                ...createCompanyDto,
                plan: 'FREE',
            },
        });
    }
    async create(createCompanyDto) {
        const existingCompany = await this.prisma.company.findUnique({
            where: { cnpj: createCompanyDto.cnpj },
        });
        if (existingCompany) {
            throw new common_1.ConflictException('Já existe uma empresa com este CNPJ');
        }
        return this.prisma.company.create({
            data: createCompanyDto,
        });
    }
    async findAll() {
        return this.prisma.company.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                cnpj: true,
                address: true,
                phone: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findOne(id) {
        return this.prisma.company.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                cnpj: true,
                address: true,
                phone: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                consultants: {
                    select: {
                        consultant: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async updatePlan(id, plan) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });
        if (!company) {
            throw new common_1.BadRequestException('Empresa não encontrada');
        }
        return this.prisma.company.update({
            where: { id },
            data: { plan },
        });
    }
    async findConsultantCompanies(consultantId) {
        const consultant = await this.prisma.user.findUnique({
            where: { id: consultantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                maxCompanies: true,
                consultantCompanies: {
                    select: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                cnpj: true,
                                address: true,
                                phone: true,
                                email: true,
                                plan: true,
                                actionCount: true,
                                maxActions: true,
                                createdAt: true,
                                updatedAt: true,
                                users: {
                                    select: {
                                        id: true,
                                        role: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!consultant) {
            throw new common_1.BadRequestException('Consultor não encontrado');
        }
        const companies = consultant.consultantCompanies.map((cc) => {
            const company = cc.company;
            const managers = company.users.filter((user) => user.role === 'MANAGER').length;
            const collaborators = company.users.filter((user) => user.role === 'COLLABORATOR').length;
            return {
                ...company,
                managers,
                collaborators,
            };
        });
        return {
            id: consultant.id,
            name: consultant.name,
            email: consultant.email,
            role: consultant.role,
            plan: consultant.plan,
            maxCompanies: consultant.maxCompanies,
            companies,
        };
    }
    async addCompanyToConsultant(consultantId, createCompanyDto) {
        const consultant = await this.prisma.user.findUnique({
            where: { id: consultantId },
            select: {
                maxCompanies: true,
                plan: true,
                consultantCompanies: {
                    select: {
                        companyId: true,
                    },
                },
            },
        });
        if (!consultant) {
            throw new common_1.BadRequestException('Consultor não encontrado');
        }
        const maxAllowedCompanies = consultant.plan === 'FREE' ? 1 : consultant.maxCompanies;
        if (consultant.consultantCompanies.length >= maxAllowedCompanies) {
            throw new common_1.BadRequestException(`Limite de empresas atingido. Plano atual: ${consultant.plan}. Limite: ${maxAllowedCompanies}`);
        }
        const existingCompany = await this.prisma.company.findUnique({
            where: { cnpj: createCompanyDto.cnpj },
        });
        if (existingCompany) {
            throw new common_1.ConflictException('CNPJ já cadastrado');
        }
        const company = await this.prisma.company.create({
            data: {
                ...createCompanyDto,
                consultants: {
                    create: {
                        consultantId,
                    },
                },
            },
        });
        return company;
    }
    async findAllForSelect() {
        return this.prisma.company.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                cnpj: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findConsultantCompaniesForSelect(consultantId) {
        const consultant = await this.prisma.user.findUnique({
            where: { id: consultantId },
            select: {
                consultantCompanies: {
                    select: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                cnpj: true,
                            },
                        },
                    },
                },
            },
        });
        if (!consultant) {
            throw new common_1.BadRequestException('Consultor não encontrado');
        }
        return consultant.consultantCompanies
            .map((cc) => cc.company)
            .sort((a, b) => a.name.localeCompare(b.name));
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyService);
//# sourceMappingURL=company.service.js.map