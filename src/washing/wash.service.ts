import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreatePriceDto, CreateWashDto, UpdateWashDto } from './dto/wash.dto'

@Injectable()
export class WashService {
  constructor(private prisma: PrismaService) {}

  async getAll(searchTerm?: string) {
    if (searchTerm) {
      return this.search(searchTerm)
    } else {
      return this.prisma.wash.findMany({
        include: { posts: true, price: true } // Включаем посты и прайс-лист
      })
    }
  }

  async search(searchTerm: string) {
    return this.prisma.wash.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      include: { posts: true, price: true } // Включаем посты и прайс-лист
    })
  }

  async create(createWashDto: CreateWashDto) {
    return this.prisma.wash.create({
      data: createWashDto
    })
  }

  async getById(id: string) {
    const wash = await this.prisma.wash.findUnique({
      where: { id },
      include: { posts: true, price: true } // Включаем посты и прайс-лист
    })

    if (!wash) {
      throw new NotFoundException(`Wash with id ${id} not found`)
    }

    return wash
  }

  async update(id: string, updateWashDto: UpdateWashDto) {
    const { posts, ...washData } = updateWashDto

    const updatedWash = await this.prisma.wash.update({
      where: { id },
      data: washData
    })

    if (posts && posts.length > 0) {
      await Promise.all(
        posts.map(post =>
          this.prisma.post.updateMany({
            where: { washId: id },
            data: post
          })
        )
      )
    }

    return updatedWash
  }

  async delete(id: string) {
    await this.prisma.wash.delete({
      where: { id }
    })

    return { message: `Wash with id ${id} has been deleted` }
  }

  async getUserBalance(userId: string, washId: string) {
    const washUser = await this.prisma.washUser.findUnique({
      where: {
        userId_washId: {
          userId, // Поле userId
          washId // Поле washId
        }
      }
    })

    if (!washUser) {
      throw new NotFoundException(
        `User with id ${userId} has no balance for wash with id ${washId}`
      )
    }

    return washUser
  }

  async updateUserBalance(
    userId: string,
    washId: string,
    balance: number,
    bonus: number
  ) {
    const washUser = await this.prisma.washUser.upsert({
      where: {
        userId_washId: {
          userId,
          washId
        }
      },
      update: {
        balance,
        bonus
      },
      create: {
        userId,
        washId,
        balance,
        bonus
      }
    })

    return washUser
  }

  async addPrice(washId: string, createPriceDto: CreatePriceDto) {
    const wash = await this.prisma.wash.findUnique({
      where: { id: washId }
    })

    if (!wash) {
      throw new NotFoundException(`Wash with id ${washId} not found`)
    }

    return this.prisma.price.create({
      data: {
        ...createPriceDto,
        washId
      }
    })
  }

  async getPrices(washId: string) {
    const wash = await this.prisma.wash.findUnique({
      where: { id: washId }
    })

    if (!wash) {
      throw new NotFoundException(`Wash with id ${washId} not found`)
    }

    return this.prisma.price.findMany({
      where: { washId }
    })
  }
}
