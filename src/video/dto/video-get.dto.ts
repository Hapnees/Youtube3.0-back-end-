import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString
} from 'class-validator'
import { UserEntity } from 'src/user/user.entity'

export class VideoGetDto {
	@IsNumber({}, { message: 'Отсутствует vid' })
	vid: number

	@IsString({ message: 'Некорректное название видео' })
	@IsNotEmpty({ message: 'Название не должно быть пустым' })
	title: string

	@IsOptional()
	@IsString({ message: 'Некорректное описание видео' })
	description: string

	@IsString({ message: 'Некорректный путь к превью' })
	@IsNotEmpty({ message: 'Отсутствует путь к превью' })
	thumbnailPath: string

	@IsString({ message: 'Некорректный путь к видео' })
	@IsNotEmpty({ message: 'Отсутствует путь к видео' })
	videoPath: string

	@IsBoolean({ message: 'Некорректный статус приватности' })
	isPrivate: boolean

	@IsString({ message: 'Некорректная длительность видео' })
	@IsNotEmpty({ message: 'Отсутствует длительность видео' })
	duration: string

	user: UserEntity
}
