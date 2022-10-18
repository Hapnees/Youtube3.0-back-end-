import { CommentEntity } from 'src/comment/comment.entity'
import { GenericEntity } from 'src/generic/generic.entity'
import { VideoEntity } from 'src/video/video.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity('User')
export class UserEntity extends GenericEntity {
	@Column()
	username: string

	@Column()
	email: string

	@Column({ select: false })
	password: string

	@Column({ default: '', nullable: true, type: 'text' })
	description?: string

	@Column({ name: 'avatar_path', default: '', nullable: true })
	avatarPath: string

	@Column({ name: 'header_path', default: '', nullable: true })
	headerPath?: string

	@OneToMany(() => VideoEntity, video => video.user)
	videos: VideoEntity[]

	@OneToMany(() => CommentEntity, comment => comment.user)
	comments: CommentEntity[]
}
