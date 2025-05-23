"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',
        expiresIn: process.env.JWT_EXPIRATION || '1d',
    },
    database: {
        url: process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@localhost:5432/weedu_db?schema=public',
    },
}));
//# sourceMappingURL=app.config.js.map