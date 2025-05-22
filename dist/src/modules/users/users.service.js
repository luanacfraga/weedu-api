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
    async createAdmin(createAdminDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createAdminDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Já existe um usuário com este email');
        }
        const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
        return this.prisma.user.create({
            data: {
                name: createAdminDto.name,
                email: createAdminDto.email,
                password: hashedPassword,
                role: 'ADMIN',
                plan: 'FREE',
                maxCompanies: 999999,
                maxActions: 999999,
            }
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
            include: {
                limits: true
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
                    role: 'MASTER',
                    plan: plan.type,
                    maxCompanies: 999999,
                    maxActions: 999999,
                    currentPlan: {
                        connect: { id: plan.id }
                    }
                }
            });
            const company = await prisma.company.create({
                data: {
                    name: createMasterUserDto.company.name,
                    cnpj: createMasterUserDto.company.cnpj,
                    address: createMasterUserDto.company.address,
                    phone: createMasterUserDto.company.phone,
                    email: createMasterUserDto.company.email,
                    plan: {
                        connect: { id: plan.id }
                    },
                    owner: {
                        connect: { id: masterUser.id }
                    },
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
    async createManager(createManagerDto, currentUser) {
        const userCompany = await this.prisma.company.findFirst({
            where: {
                id: createManagerDto.companyId,
                owner: { id: currentUser.id, role: 'MASTER' }
            },
            include: {
                owner: {
                    include: {
                        currentPlan: {
                            include: {
                                limits: true
                            }
                        }
                    }
                }
            }
        });
        if (!userCompany) {
            throw new common_1.ForbiddenException('Você não tem permissão para criar gestores nesta empresa');
        }
        const managerLimit = userCompany.owner.currentPlan.limits.find(limit => limit.feature === 'MANAGERS');
        if (managerLimit) {
            const currentManagers = await this.prisma.user.count({
                where: {
                    companies: {
                        some: {
                            id: createManagerDto.companyId
                        }
                    },
                    role: 'MANAGER'
                }
            });
            if (currentManagers >= managerLimit.limit) {
                throw new common_1.ForbiddenException('Limite de gestores atingido para este plano');
            }
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createManagerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Já existe um usuário com este email');
        }
        const hashedPassword = await bcrypt.hash(createManagerDto.password, 10);
        return this.prisma.user.create({
            data: {
                name: createManagerDto.name,
                email: createManagerDto.email,
                password: hashedPassword,
                role: 'MANAGER',
                plan: userCompany.owner.currentPlan.type,
                maxCompanies: 1,
                maxActions: 30,
                currentPlan: {
                    connect: { id: userCompany.owner.currentPlan.id }
                },
                companies: {
                    connect: { id: createManagerDto.companyId }
                }
            }
        });
    }
    async createCollaborator(createCollaboratorDto, currentUser) {
        const userCompany = await this.prisma.company.findFirst({
            where: {
                id: createCollaboratorDto.companyId,
                OR: [
                    { owner: { id: currentUser.id, role: 'MASTER' } },
                    { users: { some: { id: currentUser.id, role: 'MANAGER' } } }
                ]
            },
            include: {
                owner: {
                    include: {
                        currentPlan: {
                            include: {
                                limits: true
                            }
                        }
                    }
                }
            }
        });
        if (!userCompany) {
            throw new common_1.ForbiddenException('Você não tem permissão para criar colaboradores nesta empresa');
        }
        const collaboratorLimit = userCompany.owner.currentPlan.limits.find(limit => limit.feature === 'COLLABORATORS');
        if (collaboratorLimit) {
            const currentCollaborators = await this.prisma.user.count({
                where: {
                    companies: {
                        some: {
                            id: createCollaboratorDto.companyId
                        }
                    },
                    role: 'COLLABORATOR'
                }
            });
            if (currentCollaborators >= collaboratorLimit.limit) {
                throw new common_1.ForbiddenException('Limite de colaboradores atingido para este plano');
            }
        }
        const manager = await this.prisma.user.findFirst({
            where: {
                id: createCollaboratorDto.managerId,
                role: 'MANAGER',
                companies: { some: { id: createCollaboratorDto.companyId } }
            }
        });
        if (!manager) {
            throw new common_1.NotFoundException('Gestor não encontrado ou não pertence à empresa');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createCollaboratorDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Já existe um usuário com este email');
        }
        const hashedPassword = await bcrypt.hash(createCollaboratorDto.password, 10);
        return this.prisma.user.create({
            data: {
                name: createCollaboratorDto.name,
                email: createCollaboratorDto.email,
                password: hashedPassword,
                role: 'COLLABORATOR',
                plan: userCompany.owner.currentPlan.type,
                maxCompanies: 1,
                maxActions: 30,
                currentPlan: {
                    connect: { id: userCompany.owner.currentPlan.id }
                },
                manager: {
                    connect: { id: createCollaboratorDto.managerId }
                },
                companies: {
                    connect: { id: createCollaboratorDto.companyId }
                }
            }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map