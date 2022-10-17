import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { ensureDir, writeFile } from 'fs-extra'
import { imgValidator } from 'src/validator/img.validator'
import { videoValidator } from 'src/validator/video.validator'
import { existsSync } from 'fs'
import { rmSync } from 'fs-extra'

@Injectable()
export class MediaService {
	constructor(private readonly configService: ConfigService) {}

	async uplodImage(
		file: Express.Multer.File,
		userId: number,
		folder = 'default'
	) {
		if (!file) throw new NotFoundException('Изображение не найдено')

		if (folder === 'avatar') {
			const path = `./users/id_${userId}/avatar`
			if (existsSync(path)) {
				rmSync(path, { recursive: true }, () =>
					console.log(`Аватары из ${path} были удалены`)
				)
			}
		} else if (folder === 'header') {
			const path = `./users/id_${userId}/header`
			if (existsSync(path)) {
				rmSync(path, { recursive: true }, () =>
					console.log(`Шапки из ${path} были удалены`)
				)
			}
		} else if (folder.includes('thumbnail')) {
			const path = `./users/id_${userId}/${folder}`
			if (existsSync(path)) {
				rmSync(path, { recursive: true }, () =>
					console.log(`Превью из ${path} были удалены`)
				)
			} else {
				console.log(`${path} не найден`)
			}
		}

		const uploadFolder = `${this.configService.get(
			'USERS_PATH'
		)}/id_${userId}/${folder}`
		await ensureDir(uploadFolder)

		const validImgData = imgValidator(file.originalname)
		if (!validImgData.status)
			throw new BadRequestException(
				`Некорректный формат изображения .${validImgData.ext}`
			)

		await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer)

		return {
			url: `http://localhost:4000/api/media/${file.originalname}?userId=${userId}&folder=${folder}`
		}
	}

	async uploadVideo(file: Express.Multer.File, userId: number) {
		if (!userId) throw new NotFoundException(`Пользователь не найден`)
		if (!file) throw new NotFoundException('Видео не найдено')

		const vid = Date.now()
		const uploadFolder = `${this.configService.get(
			'USERS_PATH'
		)}/id_${userId}/videos/vid_${vid}`

		await ensureDir(uploadFolder)

		const validVideoData = videoValidator(file.originalname)
		if (!validVideoData.status)
			throw new BadRequestException(
				`Некорректный формат видео .${validVideoData.ext}`
			)

		await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer)

		return {
			url: `http://localhost:4000/api/media/${file.originalname}?userId=${userId}&folder=videos/vid_${vid}`,
			vid
		}
	}

	async getMedia(
		fileName: string,
		userId: number,
		folder: string,
		res: Response
	) {
		try {
			await res.sendFile(fileName, {
				root: `./${this.configService.get('USERS_PATH')}/id_${userId}/${folder}`
			})
		} catch (e) {
			throw new NotFoundException('Файл не найден')
		}
	}
}
