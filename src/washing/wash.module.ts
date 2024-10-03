import { Module } from '@nestjs/common'
import { WashService } from './wash.service'
import { WashController } from './wash.controller'
import { PrismaModule } from 'prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [WashController],
  providers: [WashService]
})
export class WashingModule {}
