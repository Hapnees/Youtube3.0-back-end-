import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/user/decorators/current-user.decorator'
import { VideoGetDto } from './dto/video-get.dto'
import { VideoUpdateDto } from './dto/video-update.dto'
import { VideoService } from './video.service'

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) { }

  @Patch('views')
  @HttpCode(200)
  updateViews(@Body() { videoId }: { videoId: number }) {
    return this.videoService.updateViews(videoId)
  }

  @Patch('dislike/add')
  @HttpCode(200)
  @Auth()
  dislike(@CurrentUser() userId: number, @Body() { id }: { id: number }) {
    return this.videoService.dislike(userId, id)
  }

  @Patch('like/add')
  @HttpCode(200)
  @Auth()
  like(@CurrentUser() userId: number, @Body() { id }: { id: number }) {
    return this.videoService.like(userId, id)
  }

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
  deleteVideo(@Body() { id }: { id: number }) {
    return this.videoService.deleteVideo(id)
  }

  @Get('profile')
  @Auth()
  getProfileVideos(@CurrentUser() userId: number) {
    return this.videoService.getProfileVideos(userId)
  }

  @Get('profile/:username')
  getProfileVideosByUsername(@Param('username') username: string) {
    return this.videoService.getProfileVideosByUsername(username)
  }

  @Get('liked')
  @Auth()
  getLikedVideos(
    @CurrentUser() userId: number,
    @Query('limit') limit: number,
    @Query('page') page: number
  ) {
    return this.videoService.getLikedVideos(userId, limit, page)
  }

  @Get()
  getVideos(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search: string,
    @Query('category') category: string
  ) {
    return this.videoService.getVideos(limit, page, search, category)
  }

  @Get('byId')
  getVideoById(
    @Query('id', ParseIntPipe) id: number,
    @Query('idFrom') idFrom?: number
  ) {
    return this.videoService.getVideoById(idFrom, id)
  }
}
