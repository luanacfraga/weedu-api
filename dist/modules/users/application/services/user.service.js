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
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
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
            throw new common_1.BadRequestException('Usuário não encontrado');
        }
        const canUpdate = await this.canUpdateUser(currentUser, user);
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
            if (newManager.role !== client_1.UserRole.MANAGER) {
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
        });
        if (!user) {
            throw new common_1.BadRequestException('Usuário não encontrado');
        }
        const canUpdate = await this.canUpdateUser(currentUser, user);
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
        });
        if (!user) {
            throw new common_1.BadRequestException('Usuário não encontrado');
        }
        const canUpdate = await this.canUpdateUser(currentUser, user);
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
        if (currentUser.role === client_1.UserRole.ADMIN) {
            return true;
        }
        if (currentUser.role === client_1.UserRole.CONSULTANT) {
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
        if (currentUser.role === client_1.UserRole.MANAGER) {
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
        const company = await this.prisma.company.findUnique({
            where: { id: createUserDto.companyId },
        });
        if (!company) {
            throw new common_1.BadRequestException('Empresa não encontrada');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                password: hashedPassword,
                role: createUserDto.role,
                companies: {
                    connect: {
                        id: createUserDto.companyId,
                    },
                },
            },
        });
        const { password, ...result } = user;
        return result;
    }
    async findAllByCompany(companyId) {
        return this.prisma.user.findMany({
            where: {
                companies: {
                    some: {
                        id: companyId,
                    },
                },
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map