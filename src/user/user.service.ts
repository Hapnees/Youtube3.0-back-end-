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

	async searchUsers(value: string, limit: number = 12, page: number = 1) {
		const offset = limit * (page - 1)
		const _users = await this.userRepo.query(`
		SELECT username, avatar_path, description, array_length(subscribers, 1) AS "subscribers_count" FROM "User" WHERE username ~* '${value}' LIMIT ${limit} OFFSET ${offset}`)

		return _users
	}

	async getSubscriptions(userId: number, limit: number = 5) {
		const _user = await this.userRepo.findOneBy({ id: userId })

		if (!_user) throw new NotFoundException('Пользователь не найден')

		const subscriptions = await this.userRepo.query(
			`SELECT username, avatar_path FROM "User" WHERE id = ANY(SELECT unnest(subscriptions) FROM "User" WHERE id=${userId}) LIMIT ${limit}`
		)

		return subscriptions
	}

	async subscribe(idFrom: number, idTo: number) {
		const _userFrom = await this.userRepo.findOneBy({ id: idFrom })
		if (!_userFrom) throw new NotFoundException('Пользователь не найден')
		const _userTo = await this.userRepo.findOneBy({ id: idTo })
		if (!_userTo) throw new NotFoundException('Пользователь не найден')

		if (
			_userFrom.subscriptions.some(el => el === idTo) &&
			_userTo.subscribers.some(el => el === idFrom)
		) {
			await this.userRepo.update(idFrom, {
				subscriptions: _userFrom.subscriptions.filter(el => el !== idTo)
			})

			await this.userRepo.update(idTo, {
				subscribers: _userTo.subscribers.filter(el => el !== idFrom)
			})

			return { message: 'Успех' }
		} else if (
			!(
				_userFrom.subscriptions.some(el => el === idTo) &&
				_userTo.subscribers.some(el => el === idFrom)
			)
		) {
			await this.userRepo.update(idFrom, {
				subscriptions: [idTo, ..._userFrom.subscriptions]
			})

			await this.userRepo.update(idTo, {
				subscribers: [idFrom, ..._userTo.subscribers]
			})
			return { message: 'Успех' }
		} else {
			return { message: 'Ошибка' }
		}
	}

	async getProfile(userId: number) {
		const _user = await this.userRepo.query(`
SELECT
  _user.id,
  _user.username,
	_user.email,
  _user.avatar_path,
  _user.header_path,
  _user.subscriptions,
	array_length(_user.subscribers, 1) AS "subscribers_count"
FROM
  "User" as _user
WHERE
  _user.id = ${userId}
		`)

		if (!_user) throw new NotFoundException('Пользователь не найден')

		const result = _user[0]

		return result
	}

	async getProfileByUsernameAuth(userId: number, username: string) {
		const _user = await this.userRepo.query(`
SELECT
  _user.id,
  _user.username,
	_user.email,
  _user.avatar_path,
  _user.header_path,
	${userId} = ANY(_user.subscribers) AS "is_subscribed",
	array_length(_user.subscribers, 1) AS "subscribers_count"
FROM
  "User" as _user
WHERE
  _user.username= '${username}'
		`)

		if (!_user) throw new NotFoundException('Пользователь не найден')

		const result = _user[0]

		return result
	}

	async getProfileByUsername(username: string) {
		const _user = await this.userRepo.query(`
SELECT
  _user.id,
  _user.username,
	_user.email,
  _user.avatar_path,
  _user.header_path,
	array_length(_user.subscribers, 1) AS "subscribers_count"
FROM
  "User" as _user
WHERE
  _user.username= '${username}'
		`)

		if (!_user) throw new NotFoundException('Пользователь не найден')

		const result = _user[0]

		return result
	}

	// async getProfileById(id: number) {
	// 	const _user = await this.userRepo.findOne({
	// 		where: { id },
	// 		relations: { videos: true }
	// 	})

	// 	if (!_user) throw new NotFoundException('Пользователь не найден')

	// 	const { createdAt, updatedAt, ...rest } = _user

	// 	return rest
	// }

	// 	async getProfileByUsername(username: string) {
	// 		const _user = await this.userRepo.query(`SELECT
	//     _user.id,
	//     _user.username,
	//     _user.email,
	//     _user.avatar_path,
	//     _user.header_path,
	// 		_user.description,
	//     (SELECT true FROM "User" WHERE _user.id = ANY(subscribers)) AS "is_subscribed",
	//    json_build_object(
	// 		'title',
	// 		_video.title,
	// 		'views',
	//     _video.views,
	// 		'created_at',
	//     _video.created_at,
	// 		'thumbnail_path',
	//     _video.thumbnail_path,
	// 		'duration',
	//     _video.duration) AS "video"
	// FROM
	//   "User" _user
	//   LEFT JOIN "Video" _video ON _video.user_id=_user.id
	// WHERE
	//   _user.username = '${username}'`)

	// 		if (!_user) throw new NotFoundException('Пользователь не найден')

	// 		const { createdAt, updatedAt, ...rest } = _user

	// 		return rest
	// 	}

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
