import { IsNotEmpty, IsString } from 'class-validator'
import { UserEntity } from 'src/user/user.entity'
import { VideoEntity } from 'src/video/video.entity'

export class CommentGetDto {
	@IsString({ message: 'Некорректный текст комментария' })
	@IsNotEmpty({ message: 'Пустой комментарий' })
	title: string

	user: UserEntity

	video: VideoEntity
}
