import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './user.entity'
import { VideoEntity } from 'src/video/video.entity'

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, VideoEntity])],
	controllers: [UserController],
	providers: [UserService]
})
export class UserModule {}
