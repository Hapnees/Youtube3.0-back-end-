import { GenericEntity } from 'src/generic/generic.entity'
import { Column, Entity } from 'typeorm'

@Entity('User')
export class UserEntity extends GenericEntity {
	@Column()
	username: string

	@Column()
	email: string

	@Column({ select: false })
	password: string
}
