import { Injectable, NotFoundException } from '@nestjs/common'
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

	async updateViews(videoId: number) {
		const _video = await this.videoRepo.findOneBy({ id: videoId })

		if (!_video) throw new NotFoundException('Видео не найдено')

		await this.videoRepo.update(videoId, { views: _video.views + 1 })

		return { message: 'Просмотры обновлены' }
	}

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

	async addVideo(video: VideoGetDto) {
		const _video = await this.videoRepo.save(video)

		return {
			message: `Видео ${video.title} было успешно добавлено`,
			videoId: _video.id
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

	async deleteVideo(id: number) {
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

	async getProfileVideosByUsername(username: string) {
		const _user = await this.userRepo.findOneBy({ username })

		if (!_user) throw new NotFoundException('Пользователь не найден')
		const _videos = await this.videoRepo.query(`SELECT
		_video.id,
		_video.user_id,
		_video.title,
    _video.duration,
    _video.views,
    _video.created_at,
		_video.is_private,
    _video.thumbnail_path
FROM
  "Video" _video
WHERE
  _video.user_id = ${_user.id} AND
	_video.is_private = false
ORDER BY
  _video.created_at DESC
`)

		if (!_videos) throw new NotFoundException('Ошибка поиска видео')

		return _videos
	}

	async getProfileVideos(userId: number) {
		const _videos = await this.videoRepo.query(`SELECT
		_video.id,
		_video.title,
    _video.duration,
    _video.views,
    _video.created_at,
		_video.is_private,
    _video.thumbnail_path
FROM
  "Video" _video
WHERE
  _video.user_id = ${userId}
ORDER BY
  _video.created_at DESC
`)

		if (!_videos) throw new NotFoundException('Пользователь не найден')

		return _videos
	}

	async getLikedVideos(userId: number, limit: number = 12, page: number = 1) {
		const _user = await this.userRepo.findOneBy({ id: userId })
		if (!_user) throw new NotFoundException('Пользователь не найден')

		const offset = limit * (page - 1)

		const videos = await this.videoRepo.query(`
		SELECT 
		_video.id,
		_video.title,
		_video.thumbnail_path,
		_video.duration,
		_video.created_at,
		_video.views,
		(_user.username, _user.avatar_path) AS "user"
		FROM "Video" _video 
		LEFT JOIN "User" _user 
		ON _user.id=_video.user_id 
		WHERE _video.id=ANY(SELECT unnest(video_liked_id) FROM "User" WHERE id=${userId})
		LIMIT ${limit}	
		OFFSET ${offset}
		;
		`)

		const totalCount = Math.ceil(
			(
				await this.userRepo.query(`
		SELECT COUNT(video_liked_id) FROM "User" WHERE id=${userId};
		`)
			)[0].count
		)

		return { videos, total_count: totalCount }
	}

	async getVideos(
		limit: number = 12,
		page: number = 1,
		search: string = '',
		category: string = 'general'
	) {
		const sort = category === 'trends' ? 'views' : 'created_at'
		const offset = limit * (page - 1)

		const videos = await this.videoRepo.query(
			`SELECT 
			pp.id,
			pp.title, 
			pp.thumbnail_path,
			pp.duration,
			pp.created_at,
			pp.views,
			json_build_object('username', p.username, 'avatar_path', p.avatar_path) AS "user"
			FROM "Video" pp 
			LEFT JOIN "User" p
			 ON p.id=pp.user_id 
			 WHERE pp.is_private=FALSE 
			 AND pp.title ~* '${search}'
			 ORDER BY pp.${sort} DESC 
			 LIMIT ${limit} 
			 OFFSET ${offset};
			 `
		)

		const total_count = Math.ceil(
			(
				await this.videoRepo.query(
					`SELECT COUNT(*) FROM "Video" WHERE title ~* '${search}' AND is_private=FALSE`
				)
			)[0].count
		)

		return { videos, total_count: total_count }
	}

	async getVideoById(idFrom: number = 0, id: number) {
		const _video = await this.videoRepo.query(
			`SELECT
  _video.*,
  json_build_object(
		'id',
		_author.id,
    'username',
    _author.username,
    'avatar_path',
    _author.avatar_path
  ) as "user"
FROM
  "Video" _video
  LEFT JOIN "User" _author ON _video.user_id = _author.id
WHERE
  _video.id = ${id}
GROUP BY
  (_video.id, _author.username, _author.avatar_path, _author.id)`
		)

		if (!_video) throw new NotFoundException('Видео не найдено')

		if (!idFrom) return _video[0]

		const Ids = (
			await this.userRepo.query(`
		SELECT video_liked_id, video_disliked_id FROM "User" WHERE id=${idFrom}
		`)
		)[0]

		const likedIds = Ids.video_liked_id
		const dislikedIds = Ids.video_disliked_id

		const is_liked = likedIds.some(el => el === id)
		const is_disliked = dislikedIds.some(el => el === id)

		const result = _video[0]

		return { ...result, is_liked, is_disliked }
	}
}
