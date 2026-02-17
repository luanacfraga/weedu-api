import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';
import { NotificationPreference } from '../shared/enums';

export class Company extends Entity {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly adminId: string,
    public readonly isBlocked: boolean,
    public readonly notificationPreference: NotificationPreference,
  ) {
    super(id);
    this.validate();
  }

  static create(params: {
    id: string;
    name: string;
    description?: string | null;
    adminId: string;
    isBlocked?: boolean;
    notificationPreference?: NotificationPreference;
  }): Company {
    return new Company(
      params.id,
      params.name,
      params.description ?? null,
      params.adminId,
      params.isBlocked ?? false,
      params.notificationPreference ?? NotificationPreference.BOTH,
    );
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.COMPANY.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredString(
      this.name,
      ErrorMessages.COMPANY.NAME_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.adminId,
      ErrorMessages.COMPANY.ADMIN_ID_REQUIRED,
    );
  }
}

export type UpdateCompanyData = {
  name?: string;
  description?: string | null;
  isBlocked?: boolean;
  notificationPreference?: NotificationPreference;
};
