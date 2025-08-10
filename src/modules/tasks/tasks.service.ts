/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Task, Board, User } from '@/database/models';
import { CreateTaskDto, UpdateTaskDto } from './dtos';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from '@/common/helpers/response.helper';
import { v4 as uuidv4 } from 'uuid';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { TaskStatus, TaskPriority, BoardVisibility } from '@/common/enums';
import { AuthenticatedUser } from '@/modules/auth/interfaces';

@Injectable()
export class TasksService {
  constructor(private readonly responseHelper: ResponseHelper) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Task>> {
    console.log('🚀 CREATE TASK SERVICE REACHED');
    console.log('📝 DTO received:', createTaskDto);
    console.log('👤 Current user:', currentUser.email);

    try {
      const board = await Board.findOne({
        where: { id: createTaskDto.boardId },
        include: [{ association: 'createdBy' }],
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      if (currentUser.role === 'user') {
        const canAccess =
          board.visibility === BoardVisibility.PUBLIC ||
          board.createdById === currentUser.id ||
          (board.visibility === BoardVisibility.ORGANIZATION &&
            board.organizationId === currentUser.organizationId);

        if (!canAccess) {
          throw new ForbiddenException('Access denied to this board');
        }
      }

      if (createTaskDto.assignedUserId) {
        const assignedUser = await User.findOne({
          where: { id: createTaskDto.assignedUserId, isActive: true },
        });

        if (!assignedUser) {
          throw new NotFoundException('Assigned user not found or inactive');
        }
      }

      if (createTaskDto.parentTaskId) {
        const parentTask = await Task.findOne({
          where: {
            id: createTaskDto.parentTaskId,
            boardId: createTaskDto.boardId,
          },
        });

        if (!parentTask) {
          throw new NotFoundException('Parent task not found in this board');
        }
      }

      const task = await Task.create({
        id: uuidv4(),
        title: createTaskDto.title,
        description: createTaskDto.description ?? undefined,
        status: createTaskDto.status || TaskStatus.TODO,
        priority: createTaskDto.priority || TaskPriority.MEDIUM,
        dueDate: createTaskDto.dueDate
          ? new Date(createTaskDto.dueDate)
          : undefined,
        startDate: createTaskDto.startDate
          ? new Date(createTaskDto.startDate)
          : undefined,
        estimatedHours: createTaskDto.estimatedHours || undefined,
        position: createTaskDto.position || undefined,
        tags: createTaskDto.tags || [],
        metadata: createTaskDto.metadata || {},
        boardId: createTaskDto.boardId,
        assignedUserId: createTaskDto.assignedUserId || undefined,
        createdById: currentUser.id,
        parentTaskId: createTaskDto.parentTaskId || undefined,
      });

      const createdTask = await Task.findOne({
        where: { id: task.id },
        include: [
          {
            association: 'board',
            attributes: ['id', 'name'],
          },
          {
            association: 'assignedUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'parentTask',
            attributes: ['id', 'title'],
            required: false,
          },
        ],
      });

      console.log('✅ Task created successfully:', task.id);

      return this.responseHelper.success<Task>({
        message: 'Task created successfully',
        response: createdTask!,
      });
    } catch (error) {
      console.log('💥 CREATE TASK ERROR:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create task');
    }
  }

  async getAllTasks(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: TaskStatus,
    priority?: TaskPriority,
    boardId?: string,
    assignedUserId?: string,
    currentUser?: AuthenticatedUser,
  ): Promise<ApiResponse<Task[]>> {
    try {
      const offset = (page - 1) * limit;

      const queryOptions: FindAndCountOptions<Task> = {
        include: [
          {
            association: 'board',
            attributes: [
              'id',
              'name',
              'visibility',
              'createdById',
              'organizationId',
            ],
          },
          {
            association: 'assignedUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'parentTask',
            attributes: ['id', 'title'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const whereConditions: WhereOptions<Task> = {};

      if (search) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (status) {
        whereConditions.status = status;
      }

      if (priority) {
        whereConditions.priority = priority;
      }

      if (boardId) {
        whereConditions.boardId = boardId;
      }

      if (assignedUserId) {
        whereConditions.assignedUserId = assignedUserId;
      }

      if (currentUser && currentUser.role === 'user') {
        queryOptions.include = [
          {
            association: 'board',
            attributes: [
              'id',
              'name',
              'visibility',
              'createdById',
              'organizationId',
            ],
            where: {
              [Op.or]: [
                { visibility: BoardVisibility.PUBLIC },
                { createdById: currentUser.id },
                ...(currentUser.organizationId
                  ? [
                      {
                        visibility: BoardVisibility.ORGANIZATION,
                        organizationId: currentUser.organizationId,
                      },
                    ]
                  : []),
              ],
            },
          },
          {
            association: 'assignedUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'parentTask',
            attributes: ['id', 'title'],
            required: false,
          },
        ];
      }

      queryOptions.where = whereConditions;

      const { count, rows: tasks } = await Task.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<Task[]>({
        message: 'Tasks retrieved successfully',
        response: tasks,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to retrieve tasks');
    }
  }

  async getTaskById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Task>> {
    try {
      const task = await Task.findOne({
        where: { id },
        include: [
          {
            association: 'board',
            attributes: [
              'id',
              'name',
              'visibility',
              'createdById',
              'organizationId',
            ],
          },
          {
            association: 'assignedUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'parentTask',
            attributes: ['id', 'title'],
            required: false,
          },
          {
            association: 'subTasks',
            attributes: ['id', 'title', 'status', 'priority'],
            required: false,
          },
          {
            association: 'comments',
            attributes: ['id', 'content', 'createdAt'],
            include: [
              {
                association: 'user',
                attributes: ['id', 'firstName', 'lastName'],
              },
            ],
            required: false,
          },
        ],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (currentUser.role === 'user') {
        const canAccess =
          task.board.visibility === BoardVisibility.PUBLIC ||
          task.board.createdById === currentUser.id ||
          task.assignedUserId === currentUser.id ||
          (task.board.visibility === BoardVisibility.ORGANIZATION &&
            task.board.organizationId === currentUser.organizationId);

        if (!canAccess) {
          throw new ForbiddenException('Access denied to this task');
        }
      }

      return this.responseHelper.success<Task>({
        message: 'Task retrieved successfully',
        response: task,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve task');
    }
  }

  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Task>> {
    console.log('🔄 UPDATE TASK SERVICE REACHED');
    console.log('📝 Task ID:', id);
    console.log('📝 Update DTO received:', updateTaskDto);

    try {
      const task = await Task.findOne({
        where: { id },
        include: [
          {
            association: 'board',
            attributes: [
              'id',
              'name',
              'visibility',
              'createdById',
              'organizationId',
            ],
          },
        ],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (currentUser.role === 'user') {
        const canUpdate =
          task.assignedUserId === currentUser.id ||
          task.createdById === currentUser.id ||
          task.board.createdById === currentUser.id;

        if (!canUpdate) {
          throw new ForbiddenException(
            'You can only update tasks assigned to you or tasks you created',
          );
        }
      }

      if (updateTaskDto.assignedUserId) {
        const assignedUser = await User.findOne({
          where: { id: updateTaskDto.assignedUserId, isActive: true },
        });

        if (!assignedUser) {
          throw new NotFoundException('Assigned user not found or inactive');
        }
      }

      const updateData: Partial<Task> = {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate
          ? new Date(updateTaskDto.dueDate)
          : undefined,
        startDate: updateTaskDto.startDate
          ? new Date(updateTaskDto.startDate)
          : undefined,
        completedAt: updateTaskDto.completedAt
          ? new Date(updateTaskDto.completedAt)
          : undefined,
        updatedAt: new Date(),
      };

      if (updateTaskDto.status === TaskStatus.DONE && !task.completedAt) {
        updateData.completedAt = new Date();
      }

      if (updateTaskDto.status && updateTaskDto.status !== TaskStatus.DONE) {
        updateData.completedAt = undefined;
      }

      // Update task
      await task.update(updateData);

      const updatedTask = await Task.findOne({
        where: { id },
        include: [
          {
            association: 'board',
            attributes: ['id', 'name'],
          },
          {
            association: 'assignedUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'parentTask',
            attributes: ['id', 'title'],
            required: false,
          },
        ],
      });

      if (!updatedTask) {
        throw new BadRequestException('Failed to retrieve updated task');
      }

      return this.responseHelper.success<Task>({
        message: 'Task updated successfully',
        response: updatedTask,
      });
    } catch (error) {
      console.log('💥 UPDATE TASK ERROR:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update task');
    }
  }

  async deleteTask(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<void>> {
    try {
      const task = await Task.findOne({
        where: { id },
        include: [
          {
            association: 'board',
            attributes: ['id', 'createdById'],
          },
        ],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (currentUser.role === 'user') {
        const canDelete =
          task.createdById === currentUser.id ||
          task.board.createdById === currentUser.id;

        if (!canDelete) {
          throw new ForbiddenException(
            'You can only delete tasks you created or tasks in boards you own',
          );
        }
      }

      await task.destroy({ force: true });

      return this.responseHelper.success<void>({
        message: 'Task deleted successfully',
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete task');
    }
  }

  async getMyTasks(
    currentUser: AuthenticatedUser,
    page: number = 1,
    limit: number = 10,
    status?: TaskStatus,
  ): Promise<ApiResponse<Task[]>> {
    try {
      const offset = (page - 1) * limit;

      const whereConditions: WhereOptions<Task> = {
        assignedUserId: currentUser.id,
      };

      if (status) {
        whereConditions.status = status;
      }

      const queryOptions: FindAndCountOptions<Task> = {
        where: whereConditions,
        include: [
          {
            association: 'board',
            attributes: ['id', 'name'],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [
          ['dueDate', 'ASC'],
          ['priority', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        limit,
        offset,
      };

      const { count, rows: tasks } = await Task.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<Task[]>({
        message: 'Your tasks retrieved successfully',
        response: tasks,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('💥 GET MY TASKS ERROR:', error);
      throw new BadRequestException('Failed to retrieve your tasks');
    }
  }

  async assignTask(
    taskId: string,
    userId: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Task>> {
    try {
      const task = await Task.findOne({
        where: { id: taskId },
        include: [{ association: 'board', attributes: ['id', 'createdById'] }],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (
        currentUser.role === 'user' &&
        task.board.createdById !== currentUser.id &&
        task.createdById !== currentUser.id
      ) {
        throw new ForbiddenException(
          'Insufficient permissions to assign tasks',
        );
      }

      const user = await User.findOne({
        where: { id: userId, isActive: true },
      });

      if (!user) {
        throw new NotFoundException('User not found or inactive');
      }

      await task.update({ assignedUserId: userId });

      const updatedTask = await Task.findOne({
        where: { id: taskId },
        include: [
          {
            association: 'board',
            attributes: ['id', 'name'],
          },
          {
            association: 'assignedUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      return this.responseHelper.success<Task>({
        message: 'Task assigned successfully',
        response: updatedTask!,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to assign task');
    }
  }
}
