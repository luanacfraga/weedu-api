import { Body, Controller, Post } from '@nestjs/common';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateMasterUserDto } from './dto/create-master-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.usersService.createAdmin(createAdminUserDto);
  }

  @Post('master')
  createMaster(@Body() createMasterUserDto: CreateMasterUserDto) {
    return this.usersService.createMaster(createMasterUserDto);
  }
} 