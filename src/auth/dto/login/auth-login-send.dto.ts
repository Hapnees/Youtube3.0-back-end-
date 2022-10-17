import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class AuthLoginSendDto {
	@IsNumber({}, { message: 'Некорректный id' })
	id: number

	@IsString({ message: 'Некорректное имя пользователя' })
	@IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
	username: string

	@IsEmail({}, { message: 'Некорректный email' })
	email: string

	@IsString({ message: 'Некорректный токен' })
	@IsNotEmpty({ message: 'Токен не может быть пустым' })
	token: string

	@IsString({ message: 'Некорректный формат аватара' })
	avatarPath: string
}
