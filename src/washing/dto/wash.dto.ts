import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateWashDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  picture?: string

  @IsString()
  @IsOptional()
  cityId?: string // Добавляем поле для связи с городом

  @IsString()
  @IsOptional()
  userId?: string
}

class UpdatePostDto {
  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  pictures?: string
}

export class UpdateWashDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  picture?: string

  @IsString()
  @IsOptional()
  cityId?: string // Добавляем поле для связи с городом

  @IsString()
  @IsOptional()
  userId?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePostDto)
  @IsOptional()
  posts?: UpdatePostDto[]
}

export class CreatePriceDto {
  @IsString()
  serviceName: string

  @IsNumber()
  price: number
}
