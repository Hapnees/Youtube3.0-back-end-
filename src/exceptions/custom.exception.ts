import { HttpException, HttpStatus } from '@nestjs/common'

export class CustomException extends HttpException {
	constructor(title = 'Ошибка', errors = [], status = HttpStatus.BAD_REQUEST) {
		super(
			{
				title,
				messages: errors
			},
			status
		)
	}
}
