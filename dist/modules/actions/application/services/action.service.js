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
exports.ActionService = void 0;
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
let ActionService = class ActionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createActionDto) {
        const company = await this.prisma.company.findUnique({
            where: { id: createActionDto.companyId },
        });
        if (!company) {
            throw new common_1.BadRequestException('Empresa não encontrada');
        }
        if (company.plan === 'FREE' && company.actionCount >= company.maxActions) {
            throw new common_1.BadRequestException('Limite de planos de ação atingido para o plano FREE');
        }
        const action = await this.prisma.action.create({
            data: {
                title: createActionDto.title,
                description: createActionDto.description,
                problem: createActionDto.problem,
                actionPlan: createActionDto.actionPlan,
                why: createActionDto.why,
                observation: createActionDto.observation,
                startDate: new Date(createActionDto.startDate),
                endDate: new Date(createActionDto.endDate),
                status: 'PENDING',
                companyId: createActionDto.companyId,
                managerId: createActionDto.managerId,
                creatorId: createActionDto.creatorId,
            },
        });
        await this.prisma.company.update({
            where: { id: company.id },
            data: {
                actionCount: {
                    increment: 1,
                },
            },
        });
        return action;
    }
    async findAll(companyId) {
        return this.prisma.action.findMany({
            where: {
                companyId,
            },
        });
    }
    async findOne(id) {
        return this.prisma.action.findUnique({
            where: { id },
        });
    }
};
exports.ActionService = ActionService;
exports.ActionService = ActionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActionService);
//# sourceMappingURL=action.service.js.map