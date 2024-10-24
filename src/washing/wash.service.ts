import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreatePriceDto, CreateWashDto, UpdateWashDto } from './dto/wash.dto'
import { MediaType } from '@prisma/client'

@Injectable()
export class WashService {
  constructor(private prisma: PrismaService) {}

  async getAll(searchTerm?: string) {
    if (searchTerm) {
      return this.search(searchTerm)
    } else {
      return this.prisma.wash.findMany({
        include: { posts: true, price: true, city: true, stories: true } // Включаем посты и прайс-лист
      })
    }
  }

  // Получение всех моек в конкретном городе
  async getWashesByCity(cityId: string) {
    const washes = await this.prisma.wash.findMany({
      where: { cityId },
      include: { posts: true, price: true, city: true, stories: true } // Включаем необходимые данные
    })

    if (washes.length === 0) {
      throw new NotFoundException(`No washes found in city with id ${cityId}`)
    }

    return washes
  }

  async search(searchTerm: string) {
    return this.prisma.wash.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      include: { posts: true, price: true, city: true, stories: true } // Включаем посты и прайс-лист
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
      include: { posts: true, price: true, city: true, stories: true } // Включаем посты и прайс-лист
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

  // Получение всех историй для мойки
  async getStoriesByWashId(washId: string) {
    const stories = await this.prisma.story.findMany({
      where: { washId }
    })

    if (!stories) {
      throw new NotFoundException(
        `Stories for wash with id ${washId} not found`
      )
    }

    return stories
  }

  async getStoriesWithWashInfo(washId: string) {
    const wash = await this.prisma.wash.findUnique({
      where: { id: washId },
      include: {
        stories: true // Включаем связанные истории
      }
    })

    if (!wash) {
      throw new NotFoundException(`Wash with id ${washId} not found`)
    }

    // Преобразуем результат в нужный формат
    return {
      washId: wash.id,
      washName: wash.name,
      washPicture: wash.picture,
      washStories: wash.stories.map(story => ({
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        duration: story.duration
      }))
    }
  }

  // Метод для получения всех историй, сгруппированных по мойкам
  async getAllStoriesGroupedByWash() {
    const washesWithStories = await this.prisma.wash.findMany({
      include: {
        stories: true // Включаем связанные истории для каждой мойки
      }
    })

    if (!washesWithStories || washesWithStories.length === 0) {
      throw new NotFoundException('No stories found')
    }

    // Формируем объект в нужном формате
    return washesWithStories.map(wash => ({
      washId: wash.id,
      washName: wash.name,
      washPicture: wash.picture,
      washStories: wash.stories.map(story => ({
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        duration: story.duration
      }))
    }))
  }

  // Добавление новой истории
  async createStory(
    washId: string,
    mediaUrl: string,
    mediaType: MediaType,
    duration: number
  ) {
    return this.prisma.story.create({
      data: {
        mediaUrl,
        mediaType,
        duration,
        washId
      }
    })
  }
}
