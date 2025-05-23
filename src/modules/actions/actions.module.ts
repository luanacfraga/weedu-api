import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { AISuggestionService } from './services/ai-suggestion.service';

@Module({
  imports: [],
  controllers: [ActionsController],
  providers: [ActionsService, PrismaService, AISuggestionService],
  exports: [ActionsService],
})
export class ActionsModule {} 