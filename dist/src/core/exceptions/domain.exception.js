"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainException = void 0;
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = 'DomainException';
    }
}
exports.DomainException = DomainException;
//# sourceMappingURL=domain.exception.js.map