import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { CustomException } from 'src/exceptions/custom.exception'
import { UserEntity } from 'src/user/user.entity'
import { Repository } from 'typeorm'
import { AuthLoginGetDto } from './dto/login/auth-login-get.dto'
import { AuthLoginSendDto } from './dto/login/auth-login-send.dto'
import { AuthRegisterGetDto } from './dto/register/auth-register-get.dto'
import * as bcrypt from 'bcrypt'
import { AuthRegisterSendDto } from './dto/register/auth-register-send.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepo: Repository<UserEntity>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async refresh(userId: number) {
		const _user = await this.userRepo.findOneBy({ id: userId })
		if (!_user) throw new NotFoundException('Пользователь не найден')

		const { createdAt, updatedAt, ...rest } = _user

		return {
			...rest,
			token: await this.issueToken(_user.id)
		}
	}

	async register(user: AuthRegisterGetDto): Promise<AuthRegisterSendDto> {
		const errors: string[] = []

		const isExistPropertyUserName = user.hasOwnProperty('username')
		if (!isExistPropertyUserName) errors.push('Отсутствует имя пользователя')
		const isExistPropertyEmail = user.hasOwnProperty('email')
		if (!isExistPropertyEmail) errors.push('Отсутствует почта')
		const isExistPropertyPassword = user.hasOwnProperty('password')
		if (!isExistPropertyPassword) errors.push('Отсутствует пароль')
		if (errors.length) throw new CustomException('Ошибка регистрации', errors)

		const isExistUserName = await this.userRepo.findOneBy({
			username: user.username
		})
		if (isExistUserName) errors.push('Имя пользователя занято')
		const isExistEmail = await this.userRepo.findOneBy({ email: user.email })
		if (isExistEmail) errors.push('Почта занята')
		if (errors.length) throw new CustomException('Ошибка регистрации', errors)

		const newUser = await this.userRepo.save({
			...user,
			password: await bcrypt.hash(user.password, 12)
		})

		const { createdAt, updatedAt, password, ...rest } = newUser

		return {
			...rest,
			token: await this.issueToken(newUser.id)
		}
	}

	async login(user: AuthLoginGetDto): Promise<AuthLoginSendDto> {
		const errors: string[] = []

		const isExistPropertyEmail = user.hasOwnProperty('email')
		if (!isExistPropertyEmail) errors.push('Отсутствует почта')
		const isExistPropertyPassword = user.hasOwnProperty('password')
		if (!isExistPropertyPassword) errors.push('Отсутствует пароль')
		if (errors.length) throw new CustomException('Ошибка регистрации', errors)

		const _user = await this.userRepo.findOne({
			where: { email: user.email },
			select: ['id', 'username', 'email', 'password']
		})
		if (!_user) throw new NotFoundException('Пользователь не найден')

		const isCorrectPassword = await bcrypt.compare(
			user.password,
			_user.password
		)
		if (!isCorrectPassword) throw new BadRequestException('Неверный пароль')

		const { password, ...rest } = _user

		return {
			...rest,
			token: await this.issueToken(_user.id)
		}
	}

	async issueToken(userId: number) {
		return await this.jwtService.signAsync(
			{ id: userId }
			// { expiresIn: this.configService.get('JWT_EXPIRES_IN') }
		)
	}
}
