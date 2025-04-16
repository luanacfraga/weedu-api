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
exports.ActionController = void 0;
const jwt_auth_guard_1 = require("../../../auth/infrastructure/guards/jwt-auth.guard");
const common_1 = require("@nestjs/common");
const create_action_dto_1 = require("../../application/dtos/create-action.dto");
const action_service_1 = require("../../application/services/action.service");
let ActionController = class ActionController {
    constructor(actionService) {
        this.actionService = actionService;
    }
    async create(createActionDto) {
        return this.actionService.create(createActionDto);
    }
    async start(id) {
        return this.actionService.startAction(id);
    }
    async complete(id) {
        return this.actionService.completeAction(id);
    }
    async findAll(companyId) {
        return this.actionService.findAll(companyId);
    }
    async findOne(id) {
        return this.actionService.findOne(id);
    }
};
exports.ActionController = ActionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_action_dto_1.CreateActionDto]),
    __metadata("design:returntype", Promise)
], ActionController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActionController.prototype, "start", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActionController.prototype, "complete", null);
__decorate([
    (0, common_1.Get)('company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActionController.prototype, "findOne", null);
exports.ActionController = ActionController = __decorate([
    (0, common_1.Controller)('actions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [action_service_1.ActionService])
], ActionController);
//# sourceMappingURL=action.controller.js.map