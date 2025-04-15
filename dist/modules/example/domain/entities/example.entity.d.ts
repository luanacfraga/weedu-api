import { BaseEntity } from '../../../../core/abstracts/base.entity';
export declare class Example extends BaseEntity {
    name: string;
    description: string;
    constructor(partial: Partial<Example>);
    validate(): void;
}
