import {
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm'

export class GenericEntity {
	@PrimaryGeneratedColumn()
	id: number

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		default: () => 'LOCALTIMESTAMP'
	})
	createdAt: Date

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		default: () => 'LOCALTIMESTAMP'
	})
	updatedAt: Date
}
