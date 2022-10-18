import { CommentEntity } from 'src/comment/comment.entity'
import { GenericEntity } from 'src/generic/generic.entity'
import { UserEntity } from 'src/user/user.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

@Entity('Video')
export class VideoEntity extends GenericEntity {
	@Column({ type: 'bigint' })
	vid: number

	@Column()
	title: string

	@Column({ default: '' })
	description: string

	@Column({ name: 'thumbnail_path' })
	thumbnailPath: string

	@Column({ name: 'video_path' })
	videoPath: string

	@Column({ name: 'is_private', default: false })
	isPrivate: boolean

	@Column()
	duration: string

	@Column({ default: 0 })
	views: number

	@Column({ default: 0 })
	likes: number

	@Column({ default: 0 })
	dislikes: number

	@ManyToOne(() => UserEntity, user => user.videos, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'user_id' })
	user: UserEntity

	@OneToMany(() => CommentEntity, comment => comment.video)
	comments: CommentEntity[]
}
