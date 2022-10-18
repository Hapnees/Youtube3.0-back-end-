import { GenericEntity } from 'src/generic/generic.entity'
import { UserEntity } from 'src/user/user.entity'
import { VideoEntity } from 'src/video/video.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('Comment')
export class CommentEntity extends GenericEntity {
	@Column()
	title: string

	@ManyToOne(() => UserEntity, user => user.comments)
	@JoinColumn({ name: 'user_id' })
	user: UserEntity

	@Column({ default: 0 })
	likes: number

	@Column({ default: 0 })
	dislikes: number

	@ManyToOne(() => VideoEntity, video => video.comments, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'video_id' })
	video: VideoEntity
}
