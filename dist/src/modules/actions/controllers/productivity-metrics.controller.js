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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductivityMetricsController = void 0;
const get_user_decorator_1 = require("../../../core/auth/decorators/get-user.decorator");
const roles_decorator_1 = require("../../../core/auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../core/auth/guards/roles.guard");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const productivity_metrics_dto_1 = require("../dto/productivity-metrics.dto");
const productivity_metrics_service_1 = require("../services/productivity-metrics.service");
let ProductivityMetricsController = class ProductivityMetricsController {
    constructor(productivityMetricsService) {
        this.productivityMetricsService = productivityMetricsService;
    }
    async getProductivityMetrics(userId, userRole, companyId, dto) {
        return this.productivityMetricsService.getProductivityMetrics(userId, companyId, dto);
    }
};
exports.ProductivityMetricsController = ProductivityMetricsController;
__decorate([
    (0, common_1.Get)('productivity'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, productivity_metrics_dto_1.ProductivityMetricsDto]),
    __metadata("design:returntype", Promise)
], ProductivityMetricsController.prototype, "getProductivityMetrics", null);
exports.ProductivityMetricsController = ProductivityMetricsController = __decorate([
    (0, common_1.Controller)('actions/metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [productivity_metrics_service_1.ProductivityMetricsService])
], ProductivityMetricsController);
//# sourceMappingURL=productivity-metrics.controller.js.map