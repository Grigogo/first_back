import { Module } from '@nestjs/common'
import { PrismaModule } from 'prisma/prisma.module'
import { CityService } from './city.service'
import { CityController } from './city.controller'

@Module({
  imports: [PrismaModule],
  controllers: [CityController],
  providers: [CityService]
})
export class CityModule {}
