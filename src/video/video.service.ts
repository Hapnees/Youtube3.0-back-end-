import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { VideoGetDto } from './dto/video-get.dto'
import { VideoUpdateDto } from './dto/video-update.dto'
import { VideoEntity } from './video.entity'
import { rm as removePath } from 'fs'
import { UserEntity } from 'src/user/user.entity'

@Injectable()
export class VideoService {
	constructor(
		@InjectRepository(VideoEntity)
		private readonly videoRepo: Repository<VideoEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepo: Repository<UserEntity>
	) {}

	async dislike(userId: number, id: number) {
		const _video = await this.videoRepo.findOneBy({ id })

		if (!_video) throw new NotFoundException('Видео не найдено')
		const _user = await this.userRepo.findOneBy({ id: userId })
		if (!_user) throw new NotFoundException('Пользователь не найден')

		if (_user.videoDislikedId.some(el => el === id)) {
			await this.videoRepo.update(id, {
				dislikes: _video.dislikes - 1
			})

			await this.userRepo.update(userId, {
				videoDislikedId: _user.videoDislikedId.filter(el => el !== id)
			})
		} else {
			await this.videoRepo.update(id, {
				dislikes: _video.dislikes + 1
			})
			await this.userRepo.update(userId, {
				videoDislikedId: [id, ..._user.videoDislikedId]
			})

			if (_user.videoLikedId.some(el => el === id)) {
				await this.videoRepo.update(id, { likes: _video.likes - 1 })

				await this.userRepo.update(userId, {
					videoLikedId: _user.videoLikedId.filter(el => el !== id)
				})
			}
		}

		return {
			message: 'Успешно',
			videoId: id
		}
	}

	async like(userId: number, id: number) {
		const _video = await this.videoRepo.findOneBy({ id })

		if (!_video) throw new NotFoundException('Видео не найдено')
		const _user = await this.userRepo.findOneBy({ id: userId })
		if (!_user) throw new NotFoundException('Пользователь не найден')

		if (_user.videoLikedId.some(el => el === id)) {
			await this.videoRepo.update(id, {
				likes: _video.likes - 1
			})

			await this.userRepo.update(userId, {
				videoLikedId: _user.videoLikedId.filter(el => el !== id)
			})
		} else {
			await this.videoRepo.update(id, {
				likes: _video.likes + 1
			})
			await this.userRepo.update(userId, {
				videoLikedId: [id, ..._user.videoLikedId]
			})

			if (_user.videoDislikedId.some(el => el === id)) {
				await this.videoRepo.update(id, { dislikes: _video.dislikes - 1 })

				await this.userRepo.update(userId, {
					videoDislikedId: _user.videoDislikedId.filter(el => el !== id)
				})
			}
		}

		return {
			message: 'Успешно',
			videoId: id
		}
	}

	async searchVideos(value: string) {
		const videos = await this.videoRepo.query(
			`SELECT pp.*, json_build_object(\'username\', p.username, \'avatar_path\', p.avatar_path) AS "user" FROM "Video" pp LEFT JOIN "User" p ON p.id=pp.user_id WHERE pp.is_private=FALSE AND pp.title ~* \'${value}\' ORDER BY pp.views`
		)

		return videos
	}

	async addVideo(video: VideoGetDto) {
		await this.videoRepo.save(video)

		return {
			message: `Видео ${video.title} было успешно добавлено`,
			username: video.user.username
		}
	}

	async updateVideo(video: VideoUpdateDto) {
		const _video = await this.videoRepo.findOne({
			where: { id: video.id },
			relations: { user: true }
		})

		if (!_video) throw new NotFoundException('Видео не найдено')

		await this.videoRepo.save(video)

		return {
			message: `Видео было успешно обновлено`,
			username: _video.user.username
		}
	}

	async deleteVideo({ id }) {
		const _video = await this.videoRepo.findOne({
			where: { id },
			relations: { user: true }
		})

		if (!_video) throw new NotFoundException('Видео не найдено')

		const path = `./users/id_${_video.user.id}/videos/vid_${_video.vid}`

		removePath(path, { recursive: true }, () =>
			console.log(`Deleted video ${_video.vid}`)
		)

		await this.videoRepo.remove(_video)

		return {
			message: `Видео ${_video.title} было удалено`,
			username: _video.user.username
		}
	}

	async getVideos() {
		const videos = await this.videoRepo.query(
			'SELECT pp.*, json_build_object(\'username\', p.username, \'avatar_path\', p.avatar_path) AS "user" FROM "Video" pp LEFT JOIN "User" p ON p.id=pp.user_id WHERE pp.is_private=FALSE ORDER BY pp.created_at LIMIT 10;'
		)

		return videos
	}

	async getVideoById(id: number) {
		const _video = await this.videoRepo.query(
			`SELECT
  _video.*,
  json_build_object(
    'username',
    _author.username,
    'avatar_path',
    _author.avatar_path,
    'is_liked',
    (SELECT true FROM "User" WHERE ${id} = ANY(video_liked_id)),
		'is_disliked',
    (SELECT true FROM "User" WHERE ${id} = ANY(video_disliked_id))
  ) as "user"
FROM
  "Video" _video
  LEFT JOIN "User" _author ON _video.user_id = _author.id
WHERE
  _video.id = ${id}
GROUP BY
  (_video.id, _author.username, _author.avatar_path)`
		)

		if (!_video) throw new NotFoundException('Видео не найдено')

		const result = _video[0]

		return result
	}
}
