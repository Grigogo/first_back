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

  // Получение всех моек в конкретном городе с балансом и бонусами для пользователя
  async getWashesByCity(cityId: string, userId: string) {
    const washes = await this.prisma.wash.findMany({
      where: { cityId },
      include: {
        posts: true,
        price: true,
        city: true,
        stories: true,
        washUser: true
      }
    })

    // Переносим balance и bonus на уровень выше для каждого wash
    const result = washes.map(wash => {
      const userWashData = wash.washUser.find(user => user.userId === userId) // Ожидаем только один элемент, так как фильтруем по userId
      console.log('userId', userId)

      return {
        ...wash,
        balance: userWashData ? userWashData.balance : 0, // Присваиваем баланс, если есть, иначе 0
        bonus: userWashData ? userWashData.bonus : 0, // Присваиваем бонус, если есть, иначе 0
        washUser: undefined // Убираем washUser из ответа
      }
    })

    return result
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
    // Проверяем, существует ли уже запись в таблице washUser для данного пользователя и мойки
    const existingWashUser = await this.prisma.washUser.findUnique({
      where: {
        userId_washId: {
          userId,
          washId
        }
      }
    })

    if (existingWashUser) {
      // Если запись существует, обновляем ее
      const updatedWashUser = await this.prisma.washUser.update({
        where: {
          userId_washId: {
            userId,
            washId
          }
        },
        data: {
          balance,
          bonus
        }
      })
      return updatedWashUser
    } else {
      // Если записи не существует, создаем новую
      const newWashUser = await this.prisma.washUser.create({
        data: {
          userId,
          washId,
          balance,
          bonus
        }
      })

      // Проверяем, есть ли уже этот userId в поле washUser в таблице Wash
      const wash = await this.prisma.wash.findUnique({
        where: { id: washId },
        include: { washUser: true }
      })

      console.log('WASH:', wash)

      if (!wash) {
        throw new NotFoundException(`Wash with id ${washId} not found`)
      }

      // Если userId еще нет в washUser, добавляем его
      if (!wash.washUser.some(user => user.userId === userId)) {
        await this.prisma.wash.update({
          where: { id: washId },
          data: {
            washUser: {
              connect: {
                id: newWashUser.id
              }
            }
          }
        })
      }

      return newWashUser
    }
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

    // Фильтруем мойки, у которых нет историй
    const filteredWashes = washesWithStories.filter(
      wash => wash.stories.length > 0
    )

    // Формируем объект в нужном формате
    return filteredWashes.map((wash, index) => ({
      id: index, // Используем порядковый номер вместо wash.id
      username: wash.name,
      title: wash.name,
      profile: wash.picture,
      stories: wash.stories.map((story, storyIndex) => ({
        id: storyIndex,
        url: story.mediaUrl,
        type: story.mediaType,
        duration: story.duration,
        isReadMore: false,
        storyId: index, // Используем порядковый номер вместо wash.id
        isSeen: false
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
