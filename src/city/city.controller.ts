import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards
} from '@nestjs/common'
import { CityService } from './city.service'
import { CreateCityDto, UpdateCityDto } from './dto/city.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Get()
  async getAll() {
    return this.cityService.getAll()
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.cityService.getById(id)
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.cityService.update(id, updateCityDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.cityService.delete(id)
  }
}
