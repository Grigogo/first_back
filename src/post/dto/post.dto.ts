import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreatePostDto {
  @IsString()
  address: string

  @IsString()
  description: string

  @IsString()
  shedule: string

  @IsNumber()
  lat: number

  @IsNumber()
  lon: number

  @IsInt()
  box: number

  @IsInt()
  distance: number

  @IsString()
  @IsOptional()
  pictures?: string
}
