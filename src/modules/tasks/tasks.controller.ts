/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { Task } from '@/database/models';
import { ApiResponse as ApiResponseType } from '@/common/helpers/response.helper';
import { AuthenticatedUser } from '@/modules/auth/interfaces';
import { TaskStatus, TaskPriority } from '@/common/enums';

// Custom interceptor for debugging
@Injectable()
export class TasksControllerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler().name;

    console.log('🎯 ===== TASKS CONTROLLER INTERCEPTOR =====');
    console.log('🔧 Handler method:', handler);
    console.log('🛤️ Request URL:', request);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('==========================================');

    return next.handle().pipe(
      tap({
        next: (data) => {
          console.log('✅ Controller method completed successfully');
          console.log(
            '📤 Response data preview:',
            data ? 'Data returned' : 'No data',
          );
        },
        error: (error) => {
          console.log('💥 Controller method failed with error:');
          console.log('Error type:', typeof error);
          console.log('Error stack:', error);
        },
      }),
    );
  }
}

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TasksControllerInterceptor)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {
    console.log('🏗️ TasksController constructor called');
  }

  @Post()
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task (Admin/Super Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task created successfully',
  })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<ApiResponseType<Task>> {
    try {
      if (!currentUser) {
        throw new Error('Authenticated user is required');
      }

      const result = await this.tasksService.createTask(
        createTaskDto,
        currentUser,
      );
      return result;
    } catch (error) {
      console.log('error :>> ', error);
      throw error;
    }
  }

  @Get()
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
  async getAllTasks(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('boardId') boardId?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @CurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<ApiResponseType<Task[]>> {
    console.log('🔍 GET ALL TASKS CONTROLLER REACHED');

    return this.tasksService.getAllTasks(
      parseInt(page),
      parseInt(limit),
      search,
      status,
      priority,
      boardId,
      assignedUserId,
      currentUser,
    );
  }

  @Get('my-tasks')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get tasks assigned to current user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  async getMyTasks(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: TaskStatus,
    @CurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<ApiResponseType<Task[]>> {
    return this.tasksService.getMyTasks(
      currentUser as any,
      parseInt(page),
      parseInt(limit),
      status,
    );
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get task by ID with full details' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async getTaskById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Task>> {
    return this.tasksService.getTaskById(id, currentUser);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({
    summary: 'Update task by ID',
    description: 'Users can update their assigned tasks or tasks they created',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Task>> {
    console.log('🎯 UPDATE TASK CONTROLLER REACHED');
    return this.tasksService.updateTask(id, updateTaskDto, currentUser);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete task by ID (Admin/Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async deleteTask(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<void>> {
    return this.tasksService.deleteTask(id, currentUser);
  }

  @Patch(':taskId/assign/:userId')
  @Roles('super_admin', 'admin')
  @ApiOperation({
    summary: 'Assign task to a user (Admin/Super Admin only)',
    description: 'Assign or reassign a task to a specific user',
  })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiParam({ name: 'userId', description: 'User ID to assign the task to' })
  async assignTask(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Task>> {
    return this.tasksService.assignTask(taskId, userId, currentUser);
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({
    summary: 'Update task status only',
    description: 'Quick status update for assigned users',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(TaskStatus),
          example: TaskStatus.IN_PROGRESS,
        },
      },
      required: ['status'],
    },
  })
  async updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Task>> {
    const updateDto: UpdateTaskDto = { status };
    return this.tasksService.updateTask(id, updateDto, currentUser);
  }

  @Get('board/:boardId')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get all tasks for a specific board' })
  @ApiParam({ name: 'boardId', description: 'Board ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  async getTasksByBoard(
    @Param('boardId') boardId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: TaskStatus,
    @CurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<ApiResponseType<Task[]>> {
    return this.tasksService.getAllTasks(
      parseInt(page),
      parseInt(limit),
      undefined,
      status,
      undefined,
      boardId,
      undefined,
      currentUser,
    );
  }
}
