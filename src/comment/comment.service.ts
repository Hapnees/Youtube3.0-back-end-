import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { stringify } from 'querystring'
import { UserEntity } from 'src/user/user.entity'
import { Repository } from 'typeorm'
import { CommentEntity } from './comment.entity'
import { CommentGetDto } from './dto/comment-get.dto'

@Injectable()
export class CommentService {
	constructor(
		@InjectRepository(CommentEntity)
		private readonly commentRepo: Repository<CommentEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepo: Repository<UserEntity>
	) {}

	async dislike(userId: number, id: number) {
		const _comment = await this.commentRepo.findOneBy({ id })

		if (!_comment) throw new NotFoundException('Комментарий не найден')
		const _user = await this.userRepo.findOneBy({ id: userId })

		if (_comment.dislikes.some(el => el === userId)) {
			await this.commentRepo.update(id, {
				dislikes: _comment.dislikes.filter(el => el !== userId)
			})

			await this.userRepo.update(userId, {
				commentDislikedId: _user.commentDislikedId.filter(el => el !== id)
			})
		} else {
			await this.commentRepo.update(id, {
				dislikes: [userId, ..._comment.dislikes]
			})

			await this.userRepo.update(userId, {
				commentDislikedId: [id, ..._user.commentDislikedId]
			})

			if (_comment.likes.some(el => el === userId)) {
				await this.commentRepo.update(id, {
					likes: _comment.likes.filter(el => el !== userId)
				})

				await this.userRepo.update(userId, {
					commentLikedId: _user.commentLikedId.filter(el => el !== id)
				})
			}
		}
	}

	async like(userId: number, id: number) {
		const _comment = await this.commentRepo.findOneBy({ id })

		if (!_comment) throw new NotFoundException('Комментарий не найден')
		const _user = await this.userRepo.findOneBy({ id: userId })

		if (_comment.likes.some(el => el === userId)) {
			await this.commentRepo.update(id, {
				likes: _comment.likes.filter(el => el !== userId)
			})

			await this.userRepo.update(userId, {
				commentLikedId: _user.commentLikedId.filter(el => el !== id)
			})
		} else {
			await this.commentRepo.update(id, { likes: [userId, ..._comment.likes] })

			await this.userRepo.update(userId, {
				commentLikedId: [id, ..._user.commentLikedId]
			})

			if (_comment.dislikes.some(el => el === userId)) {
				await this.commentRepo.update(id, {
					dislikes: _comment.dislikes.filter(el => el !== userId)
				})

				await this.userRepo.update(userId, {
					commentDislikedId: _user.commentDislikedId.filter(el => el !== id)
				})
			}
		}

		return {
			message: 'Успешно',
			commentId: id
		}
	}

	async addComment(comment: CommentGetDto) {
		const newComment = await this.commentRepo.save(comment)
		return { commentId: newComment.id }
	}

	async getComments(videoId: number) {
		return await this.commentRepo.query(`
		SELECT
  _comment.id,
  _comment.title,
	json_build_object('count', array_length(_comment.likes, 1), 'ids', _comment.likes) AS "likes",
	json_build_object('count', array_length(_comment.dislikes, 1), 'ids', _comment.dislikes) AS "dislikes",
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
