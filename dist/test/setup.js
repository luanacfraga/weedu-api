"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
const app_module_1 = require("../app.module");
const prisma_service_1 = require("../infrastructure/database/prisma.service");
const testing_1 = require("@nestjs/testing");
async function createTestApp() {
    const moduleRef = await testing_1.Test.createTestingModule({
        imports: [app_module_1.AppModule],
    })
        .overrideProvider(prisma_service_1.PrismaService)
        .useValue({
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    })
        .compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    return app;
}
//# sourceMappingURL=setup.js.map