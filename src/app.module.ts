import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getTypeOrmConfig } from './config/postgres.config'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { MediaModule } from './media/media.module'
import { VideoModule } from './video/video.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getTypeOrmConfig
		}),
		UserModule,
		AuthModule,
		MediaModule,
		VideoModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
