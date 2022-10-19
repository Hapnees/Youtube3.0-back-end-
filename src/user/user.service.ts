import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserUpdateDto } from './dto/user-update.dto'
import { UserEntity } from './user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepo: Repository<UserEntity>
	) {}

	async getProfile(userId: number) {
		const _user = await this.userRepo.findOne({
			where: { id: userId },
			relations: { videos: true }
		})

		if (!_user) throw new NotFoundException('Пользователь не найден')

		const { createdAt, updatedAt, ...rest } = _user

		return rest
	}

	async getProfileById(id: number) {
		const _user = await this.userRepo.findOne({
			where: { id },
			relations: { videos: true }
		})

		if (!_user) throw new NotFoundException('Пользователь не найден')

		const { createdAt, updatedAt, ...rest } = _user

		return rest
	}

	async getProfileByUsername(username: string) {
		const _user = await this.userRepo.findOne({
			where: { username },
			relations: { videos: true }
		})

		if (!_user) throw new NotFoundException('Пользователь не найден')

		const { createdAt, updatedAt, ...rest } = _user

		return rest
	}

	async updateProfile(userId: number, userData: UserUpdateDto) {
		const _user = await this.userRepo.findOne({
			where: { id: userId },
			select: [
				'id',
				'username',
				'email',
				'description',
				'avatarPath',
				'headerPath',
				'password'
			]
		})

		if (!_user) throw new NotFoundException('Пользователь не найден')

		if (userData.password)
			userData.password = await bcrypt.hash(userData.password, 12)

		await this.userRepo.update(_user.id, userData)

		return {
			username: _user.username,
			email: _user.email
		}
	}
}
