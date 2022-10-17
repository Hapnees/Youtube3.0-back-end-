import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString
} from 'class-validator'

export class VideoUpdateDto {
	@IsNumber({}, { message: 'Некорректный id видео' })
	id: number

	@IsString({ message: 'Некорректное название видео' })
	@IsNotEmpty({ message: 'Название не должно быть пустым' })
	title: string

	@IsOptional()
	@IsString({ message: 'Некорректное описание видео' })
	description: string

	@IsString({ message: 'Некорректный путь к превью' })
	@IsNotEmpty({ message: 'Отсутствует путь к превью' })
	thumbnailPath: string

	@IsBoolean({ message: 'Некорректный статус приватности' })
	isPrivate: boolean
}
