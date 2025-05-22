import { Body, Controller, Post } from '@nestjs/common';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.usersService.createAdmin(createAdminUserDto);
  }
} 