import {
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm'

export class GenericEntity {
	@PrimaryGeneratedColumn()
	id: number

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date
}
