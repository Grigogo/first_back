import { IsOptional, IsString } from 'class-validator'

export class UserDto {
  phoneNumber: string

  @IsOptional()
  @IsString()
  pin?: string

  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  avatarPath: string

  @IsOptional()
  @IsString()
  phone?: string
}
