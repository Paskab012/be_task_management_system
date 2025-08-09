import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dtos';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { TaskComment } from '@/database/models';
import { ApiResponse as ApiResponseType } from '@/common/helpers/response.helper';
import { AuthenticatedUser } from '@/modules/auth/interfaces';

@ApiTags('Comments')
@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles('super_admin', 'admin', 'user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new comment on a task' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment created successfully',
  })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<TaskComment>> {
    return this.commentsService.createComment(createCommentDto, currentUser);
  }

  @Get('task/:taskId')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get all comments for a specific task' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getCommentsByTask(
    @Param('taskId') taskId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<TaskComment[]>> {
    return this.commentsService.getCommentsByTask(
      taskId,
      parseInt(page),
      parseInt(limit),
      currentUser,
    );
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Update comment (author or admin only)' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<TaskComment>> {
    return this.commentsService.updateComment(
      id,
      updateCommentDto,
      currentUser,
    );
  }

  @Delete(':id')
  @Roles('super_admin', 'admin', 'user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete comment (author or admin only)' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<void>> {
    return this.commentsService.deleteComment(id, currentUser);
  }
}
