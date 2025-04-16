import { PrismaService } from '@infrastructure/database/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { CompanyService } from './application/services/company.service';
import { CompanyController } from './presentation/controllers/company.controller';

@Module({
  imports: [AuthModule],
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService],
  exports: [CompanyService],
})
export class CompaniesModule {}
