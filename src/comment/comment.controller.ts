import {
	Body,
	Controller,
	Get,
	HttpCode,
	Patch,
	Post,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CommentService } from './comment.service'
import { CommentGetDto } from './dto/comment-get.dto'

@Controller('comment')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Patch('dislike')
	@Auth()
	@HttpCode(200)
	dislike(
		@Body() { userId, commentId }: { userId: number; commentId: number }
	) {
		return this.commentService.dislike(userId, commentId)
	}

	@Patch('like')
	@Auth()
	@HttpCode(200)
	like(@Body() { userId, commentId }: { userId: number; commentId: number }) {
		return this.commentService.like(userId, commentId)
	}

	@Post('add')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	addComment(@Body() comment: CommentGetDto) {
		return this.commentService.addComment(comment)
	}

	@Get('get')
	getComments(@Query('videoId') videoId: number) {
		return this.commentService.getComments(videoId)
	}
}
