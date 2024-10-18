import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { WashingModule } from './washing/wash.module'
import { PostModule } from './post/post.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { CityModule } from './city/city.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    WashingModule,
    CityModule,
    PostModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Путь к директории с файлами
      serveRoot: '/uploads', // Префикс маршрута для обслуживания статических файлов
      serveStaticOptions: {
        index: false // Отключаем ожидание файла index.html
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
