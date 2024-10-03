import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards
} from '@nestjs/common'
import { WashService } from './wash.service'
import { CreatePriceDto, CreateWashDto, UpdateWashDto } from './dto/wash.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('washing')
export class WashController {
  constructor(private readonly washService: WashService) {}

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Get()
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.washService.getAll(searchTerm)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body() createWashDto: CreateWashDto) {
    return this.washService.create(createWashDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.washService.getById(id)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateWashDto: UpdateWashDto) {
    return this.washService.update(id, updateWashDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.washService.delete(id)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Get('balance/:userId/:washId')
  async getUserBalance(
    @Param('userId') userId: string,
    @Param('washId') washId: string
  ) {
    return this.washService.getUserBalance(userId, washId)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Put('balance/:userId/:washId')
  async updateUserBalance(
    @Param('userId') userId: string,
    @Param('washId') washId: string,
    @Body('balance') balance: number,
    @Body('bonus') bonus: number
  ) {
    return this.washService.updateUserBalance(userId, washId, balance, bonus)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Post('prices/:washId')
  async addPrice(
    @Param('washId') washId: string,
    @Body() createPriceDto: CreatePriceDto
  ) {
    return this.washService.addPrice(washId, createPriceDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Get('prices/:washId')
  async getPrices(@Param('washId') washId: string) {
    return this.washService.getPrices(washId)
  }
}
