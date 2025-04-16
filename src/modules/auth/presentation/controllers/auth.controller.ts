import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { ConsultantGuard } from '../../infrastructure/guards/consultant.guard';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { LoginDto } from '../dtos/login.dto';
import { RegisterBusinessDto } from '../dtos/register-business.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { RegisterDto } from '../dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register/business')
  async registerBusiness(@Body() registerBusinessDto: RegisterBusinessDto) {
    return this.authService.registerBusiness(registerBusinessDto);
  }

  @Post('register/user')
  @UseGuards(JwtAuthGuard, ConsultantGuard)
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
