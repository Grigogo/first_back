import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as express from 'express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.enableCors()
  // Настраиваем раздачу статических файлов
  app.use('/uploads', express.static(join(__dirname, '..', '..', 'uploads')))
  await app.listen(4200)
}
bootstrap()
