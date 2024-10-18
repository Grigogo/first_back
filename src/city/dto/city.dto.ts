import { IsString, IsOptional } from 'class-validator'

export class CreateCityDto {
  @IsString()
  name: string
}

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  name?: string
}
