import {
  Body,
  Controller,
  Post,
  Param,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { PostService } from './post.service'
import { CreatePostDto } from './dto/post.dto'

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UsePipes(new ValidationPipe())
  @Post(':washId')
  async create(
    @Param('washId') washId: string,
    @Body() createPostDto: CreatePostDto
  ) {
    return this.postService.create(washId, createPostDto)
  }
}
