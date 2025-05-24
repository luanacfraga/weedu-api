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
exports.ActionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const get_user_decorator_1 = require("../../core/auth/decorators/get-user.decorator");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const actions_service_1 = require("./actions.service");
const create_action_dto_1 = require("./dto/create-action.dto");
const update_action_dto_1 = require("./dto/update-action.dto");
const ai_suggestion_service_1 = require("./services/ai-suggestion.service");
let ActionsController = class ActionsController {
    constructor(actionsService, aiSuggestionService) {
        this.actionsService = actionsService;
        this.aiSuggestionService = aiSuggestionService;
    }
    async suggestAction(description) {
        return this.aiSuggestionService.generateActionSuggestion(description);
    }
    findAvailableResponsibles(userId, userRole, companyId) {
        return this.actionsService.findAvailableResponsibles(userId, userRole, companyId);
    }
    createAction(userId, userRole, createActionDto) {
        return this.actionsService.createAction(userId, userRole, createActionDto);
    }
    findAll(userId, userRole, companyId, responsibleId, status, isBlocked, isLate, priority, startDate, endDate, dateType, dateRange) {
        return this.actionsService.findAll(userId, userRole, companyId, responsibleId, status, isBlocked, isLate, priority, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, dateType, dateRange);
    }
    findOne(userId, userRole, id) {
        return this.actionsService.findOne(userId, userRole, id);
    }
    update(userId, userRole, id, updateActionDto) {
        return this.actionsService.update(userId, userRole, id, updateActionDto);
    }
    moveAction(userId, userRole, id, column, position) {
        return this.actionsService.moveAction(userId, userRole, id, column, position);
    }
    remove(userId, id) {
        return this.actionsService.remove(userId, id);
    }
};
exports.ActionsController = ActionsController;
__decorate([
    (0, common_1.Post)('suggest'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActionsController.prototype, "suggestAction", null);
__decorate([
    (0, common_1.Get)('responsibles'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "findAvailableResponsibles", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_action_dto_1.CreateActionDto]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "createAction", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Query)('responsibleId')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('isBlocked')),
    __param(6, (0, common_1.Query)('isLate')),
    __param(7, (0, common_1.Query)('priority')),
    __param(8, (0, common_1.Query)('startDate')),
    __param(9, (0, common_1.Query)('endDate')),
    __param(10, (0, common_1.Query)('dateType')),
    __param(11, (0, common_1.Query)('dateRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Boolean, Boolean, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_action_dto_1.UpdateActionDto]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/move'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.COLLABORATOR),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)('column')),
    __param(4, (0, common_1.Body)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "moveAction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MASTER, client_1.UserRole.ADMIN),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "remove", null);
exports.ActionsController = ActionsController = __decorate([
    (0, common_1.Controller)('actions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [actions_service_1.ActionsService,
        ai_suggestion_service_1.AISuggestionService])
], ActionsController);
//# sourceMappingURL=actions.controller.js.map