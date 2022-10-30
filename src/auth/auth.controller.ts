import {
	Body,
	Controller,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthLoginGetDto } from './dto/login/auth-login-get.dto'
import { AuthRegisterGetDto } from './dto/register/auth-register-get.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	register(@Body() user: AuthRegisterGetDto) {
		return this.authService.register(user)
	}

	@Post('login')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	login(@Body() user: AuthLoginGetDto) {
		return this.authService.login(user)
	}
}
