import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const getTypeOrmConfig = async (
	configService: ConfigService
): Promise<TypeOrmModuleOptions> => ({
	type: 'postgres',
	host: configService.get('POSTGRES_HOST'),
	username: configService.get('POSTGRES_USERNAME'),
	password: configService.get('POSTGRES_PASSWORD'),
	port: parseInt(configService.get('POSTGRES_PORT')),
	database: configService.get('POSTGRES_DATABASE'),
	autoLoadEntities: true,
	synchronize: true
})
