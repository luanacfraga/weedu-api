"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const base_entity_1 = require("../../../../core/abstracts/base.entity");
class User extends base_entity_1.BaseEntity {
    constructor(partial) {
        super(partial);
        Object.assign(this, partial);
    }
    validate() {
        if (!this.email) {
            throw new Error('Email is required');
        }
        if (!this.password) {
            throw new Error('Password is required');
        }
        if (!this.name) {
            throw new Error('Name is required');
        }
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map