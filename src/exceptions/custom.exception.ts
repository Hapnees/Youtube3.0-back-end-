import { HttpException, HttpStatus } from '@nestjs/common'

export class CustomException extends HttpException {
	constructor(title = 'Ошибка', errors = []) {
		super(
			{
				title,
				messages: errors
			},
			HttpStatus.BAD_REQUEST
		)
	}
}
