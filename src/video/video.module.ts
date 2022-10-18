import { Module } from '@nestjs/common'
import { VideoService } from './video.service'
import { VideoController } from './video.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VideoEntity } from './video.entity'
import { UserEntity } from 'src/user/user.entity'
import { CommentEntity } from 'src/comment/comment.entity'

@Module({
	imports: [TypeOrmModule.forFeature([VideoEntity, UserEntity, CommentEntity])],
	controllers: [VideoController],
	providers: [VideoService]
})
export class VideoModule {}
