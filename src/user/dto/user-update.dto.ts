import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UserUpdateDto {
	@IsOptional()
	@IsString({ message: 'Некорректное имя пользователя' })
	@MinLength(3, {
		message: 'Имя пользователя должнор содержать минимум 3 символа'
	})
	username: string

	@IsOptional()
	@IsEmail({}, { message: 'Некорректный email' })
	email: string

	@IsOptional()
	@IsString({ message: 'Некорректное описание' })
	description: string

	@IsOptional()
	@IsString({ message: 'Некорректное имя аватара' })
	avatarName: string

	@IsOptional()
	@IsString({ message: 'Некорректное имя шапки' })
	headerName: string

	@IsOptional()
	@IsString({ message: 'Некорректный пароль' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string
}
