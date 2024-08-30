import { BadRequestException, Injectable } from '@nestjs/common'
import { AuthDto } from './dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { faker } from '@faker-js/faker'
import * as argon2 from 'argon2'
import crypto from 'crypto'
import { JwtService } from '@nestjs/jwt'

async function generateNumericHash(password) {
  // Генерируем хеш с использованием Argon2
  const hash = await argon2.hash(password)

  // Преобразуем хеш в числовой формат
  const numericHash = crypto.createHash('sha256').update(hash).digest('hex')
  const numericValue = Number('0x' + numericHash)

  return numericValue
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async register(dto: AuthDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber
      }
    })

    if (oldUser) throw new BadRequestException('User already exists')

    const user = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,
        name: faker.person.firstName(),
        picture: faker.image.avatar(),
        pin: await generateNumericHash(dto.pin),
        balance: 0,
        cashback: 0
      }
    })
    return user
  }

  private 
}
