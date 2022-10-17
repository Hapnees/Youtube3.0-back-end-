import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Put,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from './decorators/current-user.decorator'
import { UserUpdateDto } from './dto/user-update.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	getProfile(@CurrentUser() userId) {
		return this.userService.getProfile(userId)
	}

	@Get(':username')
	getProfileByUsername(@Param('username') username: string) {
		return this.userService.getProfileByUsername(username)
	}

	@Get()
	getProfileById(@Query('id') id: number) {
		return this.userService.getProfileById(id)
	}

	@Put('profile/update')
	@UsePipes(new ValidationPipe())
	@Auth()
	updateProfile(@CurrentUser() userId, @Body() userData: UserUpdateDto) {
		return this.userService.updateProfile(userId, userData)
	}
}
