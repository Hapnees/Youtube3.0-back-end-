import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { VideoGetDto } from './dto/video-get.dto'
import { VideoUpdateDto } from './dto/video-update.dto'
import { VideoEntity } from './video.entity'
import { rm as removePath } from 'fs'

@Injectable()
export class VideoService {
	constructor(
		@InjectRepository(VideoEntity)
		private readonly videoRepo: Repository<VideoEntity>
	) {}

	async searchVideos(value: string) {
		const videos = await this.videoRepo.query(
			`SELECT pp.*, p.username, p.avatar_path FROM "Video" pp LEFT JOIN "User" p ON p.id=pp.user_id WHERE pp.is_private=FALSE AND pp.title ~* \'${value}\' ORDER BY pp.views`
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
    _author.avatar_path
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
