// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { AuthDto, RegisterDto } from './dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'
import { User } from '@prisma/client'
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  // Метод логина существующего пользователя
  async login(dto: AuthDto) {
    const user = await this.validateUser(dto)
    const tokens = await this.issueTokens(user.id)

    return {
      user: this.returnUserFields(user),
      ...tokens
    }
  }

  // Метод для отправки OTP-кода
  async sendOtp(phoneNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber
      }
    })

    if (!user) throw new NotFoundException('User not found')

    const otp = '123456' // Здесь должна быть логика генерации OTP-кода

    // Здесь должна быть логика отправки OTP-кода пользователю (например, по SMS)

    return {
      message: `OTP sent successfully ${otp}`
    }
  }

  // Метод для проверки OTP-кода и установки нового пароля
  async verifyOtpAndSetNewPassword(
    phoneNumber: string,
    otp: string,
    newPin: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber
      }
    })

    if (!user) throw new NotFoundException('User not found')

    const isValidOtp = otp === '123456' // Здесь должна быть логика проверки OTP-кода

    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP')
    }

    const hashedPin = await hash(newPin)

    await this.prisma.user.update({
      where: {
        phoneNumber
      },
      data: {
        pin: hashedPin
      }
    })

    return {
      message: 'Password updated successfully'
    }
  }

  // Метод для получения новых токенов
  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken)
    if (!result) throw new UnauthorizedException('Invalid refresh token')

    const user = await this.prisma.user.findUnique({
      where: {
        id: result.id
      }
    })

    if (!user) throw new NotFoundException('User not found')

    const tokens = await this.issueTokens(user.id)

    return {
      user: this.returnUserFields(user),
      ...tokens
    }
  }

  // Метод регистрации нового пользователя
  async register(dto: RegisterDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber
      }
    })

    if (oldUser) throw new BadRequestException('User already exists')

    // Абсолютный путь к дефолтной аватарке
    const defaultAvatarPath = path.resolve('uploads/defaultAvatar.jpg')

    // Абсолютный путь для хранения аватара пользователя
    const userFolder = path.resolve('uploads/users', dto.phoneNumber)

    // Создаем папку для пользователя, если она не существует
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true })
    }

    // Копируем дефолтный аватар в папку пользователя
    const userAvatarPath = path.join(userFolder, 'avatar.jpg')
    fs.copyFileSync(defaultAvatarPath, userAvatarPath)

    const user = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,
        name: dto.name,
        picture: `https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg`, // Путь через HTTP
        pin: await hash(dto.pin),
        balance: 0,
        cashback: 0
      }
    })

    const tokens = await this.issueTokens(user.id)

    return {
      user: this.returnUserFields(user),
      ...tokens,
      message: 'Registration successful' // Добавляем сообщение об успешной регистрации
    }
  }

  // Проверка на существование пользователя
  async checkUserExists(phoneNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber
      }
    })

    return {
      exists: !!user
    }
  }

  // Метод для проверки OTP
  async verifyOtp(phoneNumber: string, name: string, otp: string, pin: string) {
    const isValidOtp = otp === '123456' // Здесь замените на реальную логику проверки OTP

    if (!isValidOtp) {
      throw new UnauthorizedException('Неверный код')
    }

    const dto: RegisterDto = {
      phoneNumber,
      pin,
      name
    }

    const user = await this.register(dto)

    return {
      user: this.returnUserFields(user.user),
      ...(await this.issueTokens(user.user.id)),
      message: 'Registration successful' // Добавляем сообщение об успешной регистрации
    }
  }

  // Выпуск токенов для пользователя
  private async issueTokens(userId: string) {
    const data = { id: userId }

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1d'
    })

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d'
    })

    return { accessToken, refreshToken }
  }

  // Возвращаем нужные поля пользователя
  private returnUserFields(user: User) {
    return {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      phoneNumber: user.phoneNumber,
      pin: user.pin,
      name: user.name,
      picture: user.picture,
      balance: user.balance,
      cashback: user.cashback
    }
  }

  // Метод для проверки пользователя (валидация пин-кода)
  private async validateUser(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber
      }
    })

    if (!user) throw new NotFoundException('User not found')

    const isValid = await verify(user.pin, dto.pin)

    if (!isValid) throw new UnauthorizedException('Invalid password')

    return user
  }
}
