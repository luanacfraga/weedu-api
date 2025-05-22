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
exports.CreatePlanDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var PlanFeature;
(function (PlanFeature) {
    PlanFeature["ACTIONS"] = "ACTIONS";
    PlanFeature["COLLABORATORS"] = "COLLABORATORS";
    PlanFeature["MANAGERS"] = "MANAGERS";
    PlanFeature["AI_SUGGESTIONS"] = "AI_SUGGESTIONS";
})(PlanFeature || (PlanFeature = {}));
var PlanType;
(function (PlanType) {
    PlanType["FREE"] = "FREE";
    PlanType["PAID"] = "PAID";
})(PlanType || (PlanType = {}));
class PlanLimitDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(PlanFeature),
    __metadata("design:type", String)
], PlanLimitDto.prototype, "feature", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlanLimitDto.prototype, "limit", void 0);
class CreatePlanDto {
}
exports.CreatePlanDto = CreatePlanDto;
__decorate([
    (0, class_validator_1.IsEnum)(PlanType),
    __metadata("design:type", String)
], CreatePlanDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePlanDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(PlanFeature, { each: true }),
    __metadata("design:type", Array)
], CreatePlanDto.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlanLimitDto),
    __metadata("design:type", Array)
], CreatePlanDto.prototype, "limits", void 0);
//# sourceMappingURL=create-plan.dto.js.map