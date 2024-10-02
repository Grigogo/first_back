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
            name: true
          }
        },
        ...selectObject
      }
    })

    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  async toggleFavorite(userId: string, washId: string) {
    const user = await this.getById(userId)

    if (!user) throw new NotFoundException('User not found!')

    const isExists = user.favorites.some(wash => wash.id === washId)

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        favorites: {
          [isExists ? 'disconnect' : 'connect']: {
            id: washId
          }
        }
      }
    })

    return { message: 'Success' }
  }
}
