import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class AuthRegisterGetDto {
	@IsString({ message: 'Некорректное имя пользователя' })
	@IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
	username: string

	@IsEmail({}, { message: 'Некорректный email' })
	email: string

	@IsString({ message: 'Некорректный пароль' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string
}
