"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansModule = void 0;
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const jwt_strategy_1 = require("../../core/auth/strategies/jwt.strategy");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const plans_controller_1 = require("./plans.controller");
const plans_service_1 = require("./plans.service");
let PlansModule = class PlansModule {
};
exports.PlansModule = PlansModule;
exports.PlansModule = PlansModule = __decorate([
    (0, common_1.Module)({
        imports: [passport_1.PassportModule],
        controllers: [plans_controller_1.PlansController],
        providers: [plans_service_1.PlansService, prisma_service_1.PrismaService, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, jwt_strategy_1.JwtStrategy],
        exports: [plans_service_1.PlansService],
    })
], PlansModule);
//# sourceMappingURL=plans.module.js.map