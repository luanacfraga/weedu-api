import { PrismaService } from '@infrastructure/database/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ActionService } from './application/services/action.service';
import { ActionController } from './presentation/controllers/action.controller';

@Module({
  imports: [AuthModule],
  controllers: [ActionController],
  providers: [ActionService, PrismaService],
  exports: [ActionService],
})
export class ActionsModule {}
