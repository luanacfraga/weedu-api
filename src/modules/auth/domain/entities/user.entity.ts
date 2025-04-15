import { BaseEntity } from '../../../../core/abstracts/base.entity';

export class User extends BaseEntity {
  email: string;
  password: string;
  name: string;

  constructor(partial: Partial<User>) {
    super(partial);
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.email) {
      throw new Error('Email is required');
    }
    if (!this.password) {
      throw new Error('Password is required');
    }
    if (!this.name) {
      throw new Error('Name is required');
    }
  }
}
