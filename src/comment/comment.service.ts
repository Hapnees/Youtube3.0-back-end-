import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CommentEntity } from './comment.entity'
import { CommentGetDto } from './dto/comment-get.dto'

@Injectable()
export class CommentService {
	constructor(
		@InjectRepository(CommentEntity)
		private readonly commentRepo: Repository<CommentEntity>
	) {}

	async addComment(comment: CommentGetDto) {
		const newComment = await this.commentRepo.save(comment)
		return { commentId: newComment.id }
	}

	async getComments(videoId: number) {
		return await this.commentRepo.query(`
		SELECT
  _comment.id,
  _comment.title,
	_comment.likes,
	_comment.dislikes,
  _comment.created_at,
  json_build_object(\'username\', _user.username, \'avatar_path\', _user.avatar_path) AS "user"
FROM
  "Comment" _comment
  LEFT JOIN "User" _user ON _comment.user_id = _user.id
WHERE
  _comment.video_id = ${videoId}
ORDER BY
	_comment.created_at DESC
`)
	}
}
