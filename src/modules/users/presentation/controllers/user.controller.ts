import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserService } from '../../application/services/user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(
      id,
      updateUserDto,
      this.getCurrentUser(),
    );
  }

  @Put(':id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return this.userService.deactivateUser(id, this.getCurrentUser());
  }

  @Put(':id/activate')
  async activateUser(@Param('id') id: string) {
    return this.userService.activateUser(id, this.getCurrentUser());
  }

  private getCurrentUser() {
    // Este método será implementado para obter o usuário atual do token JWT
    return {
      id: 'current-user-id',
      role: 'CONSULTANT', // ou MANAGER ou ADMIN
    };
  }
}
