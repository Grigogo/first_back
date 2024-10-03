import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { WashingModule } from './washing/wash.module'
import { PostModule } from './post/post.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    WashingModule,
    PostModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
