"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanColumn = exports.UserRole = exports.ActionPriority = exports.ActionStatus = void 0;
var ActionStatus;
(function (ActionStatus) {
    ActionStatus["TODO"] = "TODO";
    ActionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ActionStatus["DONE"] = "DONE";
})(ActionStatus || (exports.ActionStatus = ActionStatus = {}));
var ActionPriority;
(function (ActionPriority) {
    ActionPriority["LOW"] = "LOW";
    ActionPriority["MEDIUM"] = "MEDIUM";
    ActionPriority["HIGH"] = "HIGH";
    ActionPriority["URGENT"] = "URGENT";
})(ActionPriority || (exports.ActionPriority = ActionPriority = {}));
var UserRole;
(function (UserRole) {
    UserRole["MASTER"] = "MASTER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["COLLABORATOR"] = "COLLABORATOR";
})(UserRole || (exports.UserRole = UserRole = {}));
var KanbanColumn;
(function (KanbanColumn) {
    KanbanColumn["TODO"] = "TODO";
    KanbanColumn["IN_PROGRESS"] = "IN_PROGRESS";
    KanbanColumn["DONE"] = "DONE";
})(KanbanColumn || (exports.KanbanColumn = KanbanColumn = {}));
//# sourceMappingURL=action.js.map