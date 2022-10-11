import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/user/decorators/current-user.decorator'
import { AuthService } from './auth.service'
import { Auth } from './decorators/auth.decorator'
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

	@Post('refresh')
	@HttpCode(200)
	@Auth()
	async refresh(@CurrentUser() userId: number) {
		return await this.authService.refresh(userId)
	}

	// @Get('test')
	// @Auth()
	// get() {
	// 	return 'success'
	// }
}
