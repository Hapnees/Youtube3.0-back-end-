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

	@Get('search')
	searchUsers(
		@Query('username') username: string,
		@Query('limit') limit: number,
		@Query('page') page: number
	) {
		return this.userService.searchUsers(username, limit, page)
	}

	@Get('subscriptions')
	@Auth()
	getSubscriptions(
		@CurrentUser() userId: number,
		@Query('limit') limit: number
	) {
		return this.userService.getSubscriptions(userId, limit)
	}

	@Patch('subscribe')
	@Auth()
	subscribe(@CurrentUser() idFrom: number, @Body() { userId }) {
		return this.userService.subscribe(idFrom, userId)
	}

	@Get('profile')
	@Auth()
	getProfile(@CurrentUser() userId) {
		return this.userService.getProfile(userId)
	}

	@Get('auth/:username')
	@Auth()
	getProfileByUsernameAuth(
		@CurrentUser() userId: number,
		@Param('username') username: string
	) {
		return this.userService.getProfileByUsernameAuth(userId, username)
	}

	@Get(':username')
	getProfileByUsername(@Param('username') username: string) {
		return this.userService.getProfileByUsername(username)
	}

	// @Get()
	// getProfileById(@Query('id') id: number) {
	// 	return this.userService.getProfileById(id)
	// }

	@Put('profile/update')
	@UsePipes(new ValidationPipe())
	@Auth()
	updateProfile(@CurrentUser() userId, @Body() userData: UserUpdateDto) {
		return this.userService.updateProfile(userId, userData)
	}
}
