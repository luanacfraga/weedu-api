"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const freePlan = await prisma.plan.create({
        data: {
            type: client_1.PlanType.FREE,
            name: 'Plano Gratuito',
            description: 'Plano gratuito com funcionalidades básicas',
            price: 0,
            features: [
                client_1.PlanFeature.ACTIONS,
                client_1.PlanFeature.COLLABORATORS,
                client_1.PlanFeature.MANAGERS,
            ],
            limits: {
                create: [
                    {
                        feature: client_1.PlanFeature.ACTIONS,
                        limit: 30,
                    },
                    {
                        feature: client_1.PlanFeature.COLLABORATORS,
                        limit: 5,
                    },
                    {
                        feature: client_1.PlanFeature.MANAGERS,
                        limit: 1,
                    },
                ],
            },
        },
    });
    const paidPlan = await prisma.plan.create({
        data: {
            type: client_1.PlanType.PAID,
            name: 'Plano Premium',
            description: 'Plano premium com todas as funcionalidades',
            price: 99.9,
            features: [
                client_1.PlanFeature.ACTIONS,
                client_1.PlanFeature.COLLABORATORS,
                client_1.PlanFeature.MANAGERS,
                client_1.PlanFeature.AI_SUGGESTIONS,
            ],
            limits: {
                create: [
                    {
                        feature: client_1.PlanFeature.ACTIONS,
                        limit: 100,
                    },
                    {
                        feature: client_1.PlanFeature.COLLABORATORS,
                        limit: 20,
                    },
                    {
                        feature: client_1.PlanFeature.MANAGERS,
                        limit: 5,
                    },
                    {
                        feature: client_1.PlanFeature.AI_SUGGESTIONS,
                        limit: 50,
                    },
                ],
            },
        },
    });
    console.log({ freePlan, paidPlan });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map