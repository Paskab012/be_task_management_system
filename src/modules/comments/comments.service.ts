/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TaskComment, Task } from '@/database/models';
import { CreateCommentDto, UpdateCommentDto } from './dtos';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from '@/common/helpers/response.helper';
import { v4 as uuidv4 } from 'uuid';
import { FindAndCountOptions } from 'sequelize';
import { AuthenticatedUser } from '@/modules/auth/interfaces';
import { RoleType, BoardVisibility } from '@/common/enums';

@Injectable()
export class CommentsService {
  constructor(private readonly responseHelper: ResponseHelper) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<TaskComment>> {
    console.log('🚀 CREATE COMMENT SERVICE REACHED');
    console.log('📝 DTO received:', createCommentDto);

    try {
      const task = await Task.findOne({
        where: { id: createCommentDto.taskId },
        include: [
          {
            association: 'board',
            attributes: ['id', 'visibility', 'createdById', 'organizationId'],
          },
        ],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (currentUser.role === RoleType.USER) {
        const canComment =
          task.board.visibility === BoardVisibility.PUBLIC ||
          task.board.createdById === currentUser.id ||
          task.assignedUserId === currentUser.id ||
          task.createdById === currentUser.id ||
          (task.board.visibility === BoardVisibility.ORGANIZATION &&
            task.board.organizationId === currentUser.organizationId);

        if (!canComment) {
          throw new ForbiddenException('Access denied to comment on this task');
        }
      }

      const comment = await TaskComment.create({
        id: uuidv4(),
        content: createCommentDto.content,
        metadata: createCommentDto.metadata ?? {},
        taskId: createCommentDto.taskId,
        userId: currentUser.id,
      });

      const createdComment = await TaskComment.findOne({
        where: { id: comment.id },
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'task',
            attributes: ['id', 'title'],
          },
        ],
      });

      console.log('✅ Comment created successfully:', comment.id);

      return this.responseHelper.success<TaskComment>({
        message: 'Comment created successfully',
        response: createdComment!,
      });
    } catch (error) {
      console.log('💥 CREATE COMMENT ERROR:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create comment');
    }
  }

  async getCommentsByTask(
    taskId: string,
    page: number = 1,
    limit: number = 10,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<TaskComment[]>> {
    try {
      const task = await Task.findOne({
        where: { id: taskId },
        include: [
          {
            association: 'board',
            attributes: ['id', 'visibility', 'createdById', 'organizationId'],
          },
        ],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (currentUser.role === RoleType.USER) {
        const canAccess =
          task.board.visibility === BoardVisibility.PUBLIC ||
          task.board.createdById === currentUser.id ||
          task.assignedUserId === currentUser.id ||
          task.createdById === currentUser.id ||
          (task.board.visibility === BoardVisibility.ORGANIZATION &&
            task.board.organizationId === currentUser.organizationId);

        if (!canAccess) {
          throw new ForbiddenException('Access denied to view task comments');
        }
      }

      const offset = (page - 1) * limit;

      const queryOptions: FindAndCountOptions<TaskComment> = {
        where: { taskId },
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'ASC']],
        limit,
        offset,
      };

      const { count, rows: comments } =
        await TaskComment.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<TaskComment[]>({
        message: 'Comments retrieved successfully',
        response: comments,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve comments');
    }
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<TaskComment>> {
    try {
      const comment = await TaskComment.findOne({
        where: { id },
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        comment.userId !== currentUser.id
      ) {
        throw new ForbiddenException('You can only update your own comments');
      }

      await comment.update({
        ...updateCommentDto,
        updatedAt: new Date(),
      });

      const updatedComment = await TaskComment.findOne({
        where: { id },
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'task',
            attributes: ['id', 'title'],
          },
        ],
      });

      return this.responseHelper.success<TaskComment>({
        message: 'Comment updated successfully',
        response: updatedComment!,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update comment');
    }
  }

  async deleteComment(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<void>> {
    try {
      const comment = await TaskComment.findOne({ where: { id } });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        comment.userId !== currentUser.id
      ) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      await comment.update({ deletedAt: new Date() });

      return this.responseHelper.success<void>({
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete comment');
    }
  }
}
