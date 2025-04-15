"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Example = void 0;
const base_entity_1 = require("../../../../core/abstracts/base.entity");
class Example extends base_entity_1.BaseEntity {
    name;
    description;
    constructor(partial) {
        super(partial);
        Object.assign(this, partial);
    }
    validate() {
        if (!this.name) {
            throw new Error('Name is required');
        }
    }
}
exports.Example = Example;
//# sourceMappingURL=example.entity.js.map