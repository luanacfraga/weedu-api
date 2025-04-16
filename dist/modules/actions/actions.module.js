"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsModule = void 0;
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const auth_module_1 = require("../auth/auth.module");
const common_1 = require("@nestjs/common");
const action_service_1 = require("./application/services/action.service");
const action_controller_1 = require("./presentation/controllers/action.controller");
let ActionsModule = class ActionsModule {
};
exports.ActionsModule = ActionsModule;
exports.ActionsModule = ActionsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [action_controller_1.ActionController],
        providers: [action_service_1.ActionService, prisma_service_1.PrismaService],
        exports: [action_service_1.ActionService],
    })
], ActionsModule);
//# sourceMappingURL=actions.module.js.map