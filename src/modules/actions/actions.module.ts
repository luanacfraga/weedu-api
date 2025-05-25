import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { ProductivityMetricsController } from './controllers/productivity-metrics.controller';
import { AISuggestionService } from './services/ai-suggestion.service';
import { ProductivityMetricsService } from './services/productivity-metrics.service';

@Module({
  imports: [],
  controllers: [
    ActionsController,
    ProductivityMetricsController,
  ],
  providers: [
    ActionsService,
    PrismaService,
    AISuggestionService,
    ProductivityMetricsService,
  ],
  exports: [ActionsService],
})
export class ActionsModule {} 