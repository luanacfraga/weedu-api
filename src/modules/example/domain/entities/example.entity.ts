import { BaseEntity } from '../../../../core/abstracts/base.entity';

export class Example extends BaseEntity {
  name: string;
  description: string;

  constructor(partial: Partial<Example>) {
    super(partial);
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.name) {
      throw new Error('Name is required');
    }
  }
}
