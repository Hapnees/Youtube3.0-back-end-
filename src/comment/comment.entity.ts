import { GenericEntity } from 'src/generic/generic.entity'
import { UserEntity } from 'src/user/user.entity'
import { VideoEntity } from 'src/video/video.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('Comment')
export class CommentEntity extends GenericEntity {
	@Column()
	title: string

	@ManyToOne(() => UserEntity, user => user.comments, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'user_id' })
	user: UserEntity

	@Column('int', { default: [], array: true })
	likes: number[]

	@Column('int', { default: [], array: true })
	dislikes: number[]

	@ManyToOne(() => VideoEntity, video => video.comments, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'video_id' })
	video: VideoEntity
}
