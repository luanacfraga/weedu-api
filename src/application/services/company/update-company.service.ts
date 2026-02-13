import {
  Company,
  UpdateCompanyData,
} from '@/core/domain/company/company.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { NotificationPreference } from '@/core/domain/shared/enums';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdateCompanyInput {
  id: string;
  name?: string;
  description?: string;
  notificationPreference?: NotificationPreference;
}

export interface UpdateCompanyOutput {
  company: Company;
}

@Injectable()
export class UpdateCompanyService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: UpdateCompanyInput): Promise<UpdateCompanyOutput> {
    const company = await this.companyRepository.findById(input.id);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.id);
    }

    const updateData: Partial<UpdateCompanyData> = {};
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.notificationPreference !== undefined) {
      updateData.notificationPreference = input.notificationPreference;
    }

    const updatedCompany = await this.companyRepository.update(
      input.id,
      updateData,
    );

    return {
      company: updatedCompany,
    };
  }
}
