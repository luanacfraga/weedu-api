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
exports.AuthService = void 0;
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt_1 = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const hashedPassword = await (0, bcrypt_1.hash)(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...registerDto,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user,
            ...tokens,
        };
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isPasswordValid = await (0, bcrypt_1.compare)(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const { password: _, ...userWithoutPassword } = user;
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }
    async generateTokens(userId, email, role) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email, role }, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
            }),
            this.jwtService.signAsync({ sub: userId, email, role }, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async saveRefreshToken(userId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }
    async registerBusiness(registerBusinessDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerBusinessDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email já cadastrado');
        }
        const existingCompany = await this.prisma.company.findUnique({
            where: { cnpj: registerBusinessDto.cnpj },
        });
        if (existingCompany) {
            throw new common_1.BadRequestException('CNPJ já cadastrado');
        }
        const hashedPassword = await (0, bcrypt_1.hash)(registerBusinessDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: registerBusinessDto.name,
                email: registerBusinessDto.email,
                password: hashedPassword,
                role: 'CONSULTANT',
                plan: 'FREE',
                maxCompanies: 1,
            },
        });
        const company = await this.prisma.company.create({
            data: {
                name: registerBusinessDto.companyName,
                cnpj: registerBusinessDto.cnpj,
                address: registerBusinessDto.address,
                phone: registerBusinessDto.phone,
                email: registerBusinessDto.email,
                plan: 'FREE',
                users: {
                    connect: {
                        id: user.id,
                    },
                },
                consultants: {
                    create: {
                        consultantId: user.id,
                    },
                },
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                maxCompanies: user.maxCompanies,
            },
            company: {
                id: company.id,
                name: company.name,
                cnpj: company.cnpj,
                plan: company.plan,
            },
        };
    }
    async registerUser(registerUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerUserDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email já cadastrado');
        }
        const company = await this.prisma.company.findUnique({
            where: { id: registerUserDto.companyId },
        });
        if (!company) {
            throw new common_1.BadRequestException('Empresa não encontrada');
        }
        if (registerUserDto.role === 'COLLABORATOR') {
            const manager = await this.prisma.user.findUnique({
                where: { id: registerUserDto.managerId },
                include: { companies: true },
            });
            if (!manager) {
                throw new common_1.BadRequestException('Gestor não encontrado');
            }
            if (manager.role !== 'MANAGER') {
                throw new common_1.BadRequestException('O usuário indicado não é um gestor');
            }
            const managerBelongsToCompany = manager.companies.some((c) => c.id === registerUserDto.companyId);
            if (!managerBelongsToCompany) {
                throw new common_1.BadRequestException('O gestor não pertence à mesma empresa');
            }
        }
        const hashedPassword = await (0, bcrypt_1.hash)(registerUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: registerUserDto.name,
                email: registerUserDto.email,
                password: hashedPassword,
                role: registerUserDto.role,
                companies: {
                    connect: {
                        id: registerUserDto.companyId,
                    },
                },
                ...(registerUserDto.role === 'COLLABORATOR' && {
                    manager: {
                        connect: {
                            id: registerUserDto.managerId,
                        },
                    },
                }),
            },
        });
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map