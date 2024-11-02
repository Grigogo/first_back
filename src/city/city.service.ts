import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateCityDto, UpdateCityDto } from './dto/city.dto'

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const cities = await this.prisma.city.findMany({
      select: {
        id: true,
        name: true,
        lat: true,
        lon: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return cities.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  }

  async create(createCityDto: CreateCityDto) {
    return this.prisma.city.create({
      data: createCityDto
    })
  }

  async getById(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: { washes: true } // Включаем мойки в ответе
    })

    if (!city) {
      throw new NotFoundException(`City with id ${id} not found`)
    }

    return city
  }

  async update(id: string, updateCityDto: UpdateCityDto) {
    return this.prisma.city.update({
      where: { id },
      data: updateCityDto
    })
  }

  async delete(id: string) {
    await this.prisma.city.delete({
      where: { id }
    })

    return { message: `City with id ${id} has been deleted` }
  }
}
