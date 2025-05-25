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
exports.UsersController = void 0;
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const common_1 = require("@nestjs/common");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const create_collaborator_dto_1 = require("./dto/create-collaborator.dto");
const create_manager_dto_1 = require("./dto/create-manager.dto");
const create_master_user_dto_1 = require("./dto/create-master-user.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    createAdmin(createAdminDto) {
        return this.usersService.createAdmin(createAdminDto);
    }
    createMaster(createMasterUserDto) {
        return this.usersService.createMaster(createMasterUserDto);
    }
    createManager(createManagerDto, req) {
        return this.usersService.createManager(createManagerDto, req.user);
    }
    createCollaborator(createCollaboratorDto, req) {
        return this.usersService.createCollaborator(createCollaboratorDto, req.user);
    }
    getManagerTeam(id, req) {
        return this.usersService.getManagerTeam(id, req.user);
    }
    async getCompanyEmployees(req, companyId, page = 1, limit = 10, name, email, isActive, managerId, onlyManagers) {
        const userId = req.user.id;
        const userRole = req.user.role;
        return this.usersService.findCompanyEmployees(userId, userRole, companyId, {
            page: Number(page),
            limit: Number(limit),
            name,
            email,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            managerId,
            onlyManagers: onlyManagers === 'true',
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('master'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_master_user_dto_1.CreateMasterUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createMaster", null);
__decorate([
    (0, common_1.Post)('manager'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('MASTER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_manager_dto_1.CreateManagerDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createManager", null);
__decorate([
    (0, common_1.Post)('collaborator'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('MASTER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_collaborator_dto_1.CreateCollaboratorDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createCollaborator", null);
__decorate([
    (0, common_1.Get)('manager/:id/team'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('MASTER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getManagerTeam", null);
__decorate([
    (0, common_1.Get)('company'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('name')),
    __param(5, (0, common_1.Query)('email')),
    __param(6, (0, common_1.Query)('isActive')),
    __param(7, (0, common_1.Query)('managerId')),
    __param(8, (0, common_1.Query)('onlyManagers')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCompanyEmployees", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map