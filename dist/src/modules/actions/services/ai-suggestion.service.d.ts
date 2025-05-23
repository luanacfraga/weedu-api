import { PrismaService } from '@/infrastructure/database/prisma.service';
import { AISuggestionDto } from '../dto/ai-suggestion.dto';
export declare class AISuggestionService {
    private prisma;
    private genAI;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateActionSuggestion(description: string): Promise<AISuggestionDto>;
    private validatePriority;
}
