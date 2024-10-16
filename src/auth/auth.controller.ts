// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
  BadRequestException
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto, RegisterDto } from './dto/auth.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('send-otp')
  async sendOtp(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.sendOtp(phoneNumber)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('verify-otp-and-set-new-password')
  async verifyOtpAndSetNewPassword(
    @Body('phoneNumber') phoneNumber: string,
    @Body('otp') otp: string,
    @Body('newPin') newPin: string
  ) {
    return this.authService.verifyOtpAndSetNewPassword(phoneNumber, otp, newPin)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/access-token')
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new BadRequestException('Refresh token is required')
    }
    return this.authService.getNewTokens(dto.refreshToken)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('check-user-exists')
  async checkUserExists(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.checkUserExists(phoneNumber)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('verify-otp')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('otp') otp: string,
    @Body('name') name: string,
    @Body('pin') pin: string
  ) {
    return this.authService.verifyOtp(phoneNumber, name, otp, pin)
  }
}
