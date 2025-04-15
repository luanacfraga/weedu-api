"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
class BaseEntity {
    id;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base.entity.js.map