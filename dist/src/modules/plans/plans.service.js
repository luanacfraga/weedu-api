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
exports.PlansService = void 0;
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
let PlansService = class PlansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPlan(createPlanDto, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Apenas administradores podem criar planos');
        }
        return this.prisma.plan.create({
            data: {
                type: createPlanDto.type,
                name: createPlanDto.name,
                description: createPlanDto.description,
                price: createPlanDto.price,
                features: createPlanDto.features,
                limits: {
                    create: createPlanDto.limits.map(limit => ({
                        feature: limit.feature,
                        limit: limit.limit
                    }))
                }
            },
            include: {
                limits: true
            }
        });
    }
    async findAll() {
        return this.prisma.plan.findMany({
            include: {
                limits: true
            }
        });
    }
    async findOne(id) {
        return this.prisma.plan.findUnique({
            where: { id },
            include: {
                limits: true
            }
        });
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlansService);
//# sourceMappingURL=plans.service.js.map