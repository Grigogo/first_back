import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreatePostDto } from './dto/post.dto'

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(washId: string, createPostDto: CreatePostDto) {
    const wash = await this.prisma.wash.findUnique({
      where: { id: washId }
    })

    if (!wash) {
      throw new NotFoundException(`Wash with id ${washId} not found`)
    }

    return this.prisma.post.create({
      data: {
        ...createPostDto,
        washId
      }
    })
  }
}
