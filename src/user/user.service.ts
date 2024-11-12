import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { returnUserObject } from './return-user.object'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string, selectObject: Prisma.UserSelect = {}) {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      },
      select: {
        ...returnUserObject,
        favorites: {
          select: {
            id: true,
            address: true,
            description: true,
            wash: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        ...selectObject
      }
    })

    if (!user) {
      throw new NotFoundException('User not found!')
    }
    console.log('User found:', user) // Логирование
    return user
  }

  async toggleFavorite(userId: string, postId: string) {
    const user = await this.getById(userId)

    const isExists = user.favorites.some(post => post.id === postId)

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        favorites: {
          [isExists ? 'disconnect' : 'connect']: {
            id: postId
          }
        }
      }
    })

    const status = isExists ? 'removed' : 'added'

    console.log(`Post ${postId} ${status} from favorites`) // Логирование
    return { status }
  }
}
