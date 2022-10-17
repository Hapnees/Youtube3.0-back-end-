import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	ParseIntPipe,
	Post,
	Put,
	Query
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { VideoGetDto } from './dto/video-get.dto'
import { VideoUpdateDto } from './dto/video-update.dto'
import { VideoService } from './video.service'

@Controller('video')
export class VideoController {
	constructor(private readonly videoService: VideoService) {}

	@Post('add')
	@HttpCode(200)
	@Auth()
	addVideo(@Body() video: VideoGetDto) {
		return this.videoService.addVideo(video)
	}

	@Put('update')
	@HttpCode(200)
	@Auth()
	updateVideo(@Body() video: VideoUpdateDto) {
		return this.videoService.updateVideo(video)
	}

	@Delete('delete')
	@HttpCode(200)
	@Auth()
	deleteVideo(@Body() id) {
		return this.videoService.deleteVideo(id)
	}

	@Get()
	getVideos() {
		return this.videoService.getVideos()
	}

	@Get('byId')
	getVideoById(@Query('id', ParseIntPipe) id: number) {
		return this.videoService.getVideoById(id)
	}
}
