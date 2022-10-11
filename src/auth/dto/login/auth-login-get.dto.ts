import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class AuthLoginGetDto {
	@IsEmail({}, { message: 'Некорректный email' })
	email: string

	@IsString({ message: 'Некорректный пароль' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string
}
