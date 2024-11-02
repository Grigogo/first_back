import { IsString, IsOptional } from 'class-validator'

export class CreateCityDto {
  @IsString()
  name: string
  lat: number
  lon: number
}

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  name?: string
  lat?: number
  lon?: number
}
