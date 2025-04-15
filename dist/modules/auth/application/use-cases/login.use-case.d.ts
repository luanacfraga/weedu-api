import { JwtService } from '@nestjs/jwt';
import { IBaseRepository } from '../../../../core/abstracts/base.repository';
import { User } from '../../domain/entities/user.entity';
export declare class LoginUseCase {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: IBaseRepository<User>, jwtService: JwtService);
    execute(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
