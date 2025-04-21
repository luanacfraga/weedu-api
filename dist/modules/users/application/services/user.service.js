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
exports.UserService = void 0;
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const bcrypt_1 = require("bcrypt");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateUser(userId, updateUserDto, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                companies: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const canUpdate = await this.canUpdateUser(currentUser, {
            id: user.id,
            managerId: user.managerId,
            companies: user.companies,
        });
        if (!canUpdate) {
            throw new common_1.UnauthorizedException('Você não tem permissão para atualizar este usuário');
        }
        if (updateUserDto.managerId) {
            const newManager = await this.prisma.user.findUnique({
                where: { id: updateUserDto.managerId },
                include: { companies: true },
            });
            if (!newManager) {
                throw new common_1.BadRequestException('Gestor não encontrado');
            }
            if (newManager.role !== 'MANAGER') {
                throw new common_1.BadRequestException('O usuário indicado não é um gestor');
            }
            const sameCompany = newManager.companies.some((company) => user.companies.some((userCompany) => userCompany.id === company.id));
            if (!sameCompany) {
                throw new common_1.BadRequestException('O gestor não pertence à mesma empresa');
            }
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                name: updateUserDto.name,
                email: updateUserDto.email,
                role: updateUserDto.role,
                isActive: updateUserDto.isActive,
                managerId: updateUserDto.managerId,
            },
        });
    }
    async deactivateUser(userId, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                companies: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const canUpdate = await this.canUpdateUser(currentUser, {
            id: user.id,
            managerId: user.managerId,
            companies: user.companies,
        });
        if (!canUpdate) {
            throw new common_1.UnauthorizedException('Você não tem permissão para desativar este usuário');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
            },
        });
    }
    async activateUser(userId, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                companies: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const canUpdate = await this.canUpdateUser(currentUser, {
            id: user.id,
            managerId: user.managerId,
            companies: user.companies,
        });
        if (!canUpdate) {
            throw new common_1.UnauthorizedException('Você não tem permissão para ativar este usuário');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: true,
            },
        });
    }
    async canUpdateUser(currentUser, targetUser) {
        if (currentUser.role === 'ADMIN') {
            return true;
        }
        if (currentUser.role === 'CONSULTANT') {
            const currentUserCompanies = await this.prisma.user.findUnique({
                where: { id: currentUser.id },
                include: { companies: true },
            });
            const targetUserCompanies = await this.prisma.user.findUnique({
                where: { id: targetUser.id },
                include: { companies: true },
            });
            return currentUserCompanies.companies.some((company) => targetUserCompanies.companies.some((targetCompany) => targetCompany.id === company.id));
        }
        if (currentUser.role === 'MANAGER') {
            return targetUser.managerId === currentUser.id;
        }
        return false;
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const { companyId, managerId, password, ...userData } = createUserDto;
        const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
        if (managerId) {
            const manager = await this.prisma.user.findUnique({
                where: { id: managerId },
                include: { companies: true },
            });
            if (!manager) {
                throw new common_1.BadRequestException('Gestor não encontrado');
            }
            if (manager.role !== 'MANAGER') {
                throw new common_1.BadRequestException('O usuário indicado não é um gestor');
            }
            const managerBelongsToCompany = manager.companies.some((company) => company.id === companyId);
            if (!managerBelongsToCompany) {
                throw new common_1.BadRequestException('O gestor não pertence à mesma empresa');
            }
        }
        return this.prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                managerId,
                companies: {
                    connect: {
                        id: companyId,
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                companies: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async findAllByCompany(companyId, { page = 1, limit = 10 }) {
        const where = {
            companies: {
                some: {
                    id: companyId,
                },
            },
            deletedAt: null,
        };
        const skip = (page - 1) * limit;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    manager: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    name: 'asc',
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
    async findAllByManager(managerId, { page = 1, limit = 10 }) {
        const manager = await this.prisma.user.findUnique({
            where: { id: managerId },
            include: {
                companies: true,
            },
        });
        if (!manager) {
            throw new common_1.NotFoundException('Gestor não encontrado');
        }
        if (manager.role !== 'MANAGER') {
            throw new common_1.BadRequestException('O usuário não é um gestor');
        }
        if (!manager.companies || manager.companies.length === 0) {
            throw new common_1.BadRequestException('O gestor não está associado a nenhuma empresa');
        }
        const companyId = manager.companies[0].id;
        const where = {
            managerId,
            companies: {
                some: {
                    id: companyId,
                },
            },
            deletedAt: null,
        };
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    companies: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    name: 'asc',
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map