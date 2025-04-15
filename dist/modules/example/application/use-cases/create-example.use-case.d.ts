import { IBaseRepository } from '../../../../core/abstracts/base.repository';
import { Example } from '../../domain/entities/example.entity';
export declare class CreateExampleUseCase {
    private readonly exampleRepository;
    constructor(exampleRepository: IBaseRepository<Example>);
    execute(data: Partial<Example>): Promise<Example>;
}
