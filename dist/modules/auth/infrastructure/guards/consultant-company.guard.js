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
exports.ConsultantCompanyGuard = void 0;
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let ConsultantCompanyGuard = class ConsultantCompanyGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const companyId = request.body.companyId;
        if (!user || !user.id || !companyId) {
            throw new common_1.UnauthorizedException('Usuário não autenticado ou empresa não especificada');
        }
        const consultantCompany = await this.prisma.consultantCompany.findUnique({
            where: {
                consultantId_companyId: {
                    consultantId: user.id,
                    companyId: companyId,
                },
            },
        });
        if (!consultantCompany) {
            throw new common_1.UnauthorizedException('Consultor não tem acesso a esta empresa');
        }
        return true;
    }
};
exports.ConsultantCompanyGuard = ConsultantCompanyGuard;
exports.ConsultantCompanyGuard = ConsultantCompanyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], ConsultantCompanyGuard);
//# sourceMappingURL=consultant-company.guard.js.map