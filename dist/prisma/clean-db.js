"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function cleanDatabase() {
    try {
        await prisma.$executeRaw `SET session_replication_role = 'replica';`;
        const tables = [
            'ActionMovement',
            'ActionMetric',
            'ChecklistItem',
            'KanbanOrder',
            'AISuggestion',
            'Action',
            'CompanyUsage',
            'CompanyAICredits',
            'Subscription',
            'Company',
            'PlanLimit',
            'Plan',
            'RefreshToken',
            'CollaboratorPerformance',
            'User',
        ];
        for (const table of tables) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
            console.log(`Tabela ${table} limpa com sucesso`);
        }
        await prisma.$executeRaw `SET session_replication_role = 'origin';`;
        console.log('Banco de dados limpo com sucesso!');
    }
    catch (error) {
        console.error('Erro ao limpar o banco de dados:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
cleanDatabase();
//# sourceMappingURL=clean-db.js.map