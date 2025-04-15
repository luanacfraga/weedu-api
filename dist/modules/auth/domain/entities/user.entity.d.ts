import { BaseEntity } from '../../../../core/abstracts/base.entity';
export declare class User extends BaseEntity {
    email: string;
    password: string;
    name: string;
    constructor(partial: Partial<User>);
    validate(): void;
}
