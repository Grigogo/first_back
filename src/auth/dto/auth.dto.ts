import { IsString, MaxLength, MinLength } from 'class-validator'

export class AuthDto {
  @IsString()
  phoneNumber: string

  @MinLength(4, {
    message: 'Длина пароля 4 символа'
  })
  @MaxLength(4, {
    message: 'Длина пароля 4 символа'
  })
  @IsString()
  pin: string
}

export class RegisterDto {
  @IsString()
  phoneNumber: string

  @IsString()
  name: string

  @IsString()
  pin: string
}

export class CheckUserExistsDto {
  @IsString()
  phoneNumber: string
}
