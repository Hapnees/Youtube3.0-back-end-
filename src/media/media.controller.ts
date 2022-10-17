import {
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Query,
	Res,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/user/decorators/current-user.decorator'
import { MediaService } from './media.service'

@Controller('media')
export class MediaController {
	constructor(private readonly mediaService: MediaService) {}

	@Post('upload/image')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('image'))
	@Auth()
	uploadImage(
		@UploadedFile() file: Express.Multer.File,
		@CurrentUser() userId: number,
		@Query('folder') folder: string
	) {
		return this.mediaService.uplodImage(file, userId, folder)
	}

	@Post('upload/video')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('video'))
	@Auth()
	uploadVideo(
		@UploadedFile() file: Express.Multer.File,
		@CurrentUser() userId
	) {
		return this.mediaService.uploadVideo(file, userId)
	}

	@Get(':fileName')
	getMedia(
		@Param('fileName') fileName: string,
		@Res() res: Response,
		@Query('folder') folder = 'default',
		@Query('userId') userId: number
	) {
		return this.mediaService.getMedia(fileName, userId, folder, res)
	}
}
