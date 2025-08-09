/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Notification, User } from '@/database/models';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from '@/common/helpers/response.helper';
import { v4 as uuidv4 } from 'uuid';
import { FindAndCountOptions, WhereOptions, Op } from 'sequelize';
import { AuthenticatedUser } from '@/modules/auth/interfaces';
import { RoleType } from '@/common/enums';
import {
  NotificationType,
  NotificationPriority,
} from '@/database/models/notification.model';

@Injectable()
export class NotificationsService {
  constructor(private readonly responseHelper: ResponseHelper) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Notification>> {
    console.log('🚀 CREATE NOTIFICATION SERVICE REACHED');
    console.log('📝 DTO received:', createNotificationDto);

    try {
      const targetUser = await User.findOne({
        where: { id: createNotificationDto.userId, isActive: true },
      });

      if (!targetUser) {
        throw new NotFoundException('Target user not found or inactive');
      }

      if (
        currentUser.role === RoleType.USER &&
        createNotificationDto.userId !== currentUser.id
      ) {
        throw new ForbiddenException(
          'You can only create notifications for yourself',
        );
      }

      const notification = await Notification.create({
        id: uuidv4(),
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        priority: createNotificationDto.priority ?? NotificationPriority.NORMAL,
        entityId: createNotificationDto.entityId ?? undefined,
        entityType: createNotificationDto.entityType ?? undefined,
        metadata: createNotificationDto.metadata ?? {},
        userId: createNotificationDto.userId,
      });

      const createdNotification = await Notification.findOne({
        where: { id: notification.id },
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      console.log('✅ Notification created successfully:', notification.id);

      return this.responseHelper.success<Notification>({
        message: 'Notification created successfully',
        response: createdNotification!,
      });
    } catch (error) {
      console.log('💥 CREATE NOTIFICATION ERROR:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create notification');
    }
  }

  async getMyNotifications(
    currentUser: AuthenticatedUser,
    page: number = 1,
    limit: number = 10,
    isRead?: boolean,
    type?: NotificationType,
  ): Promise<ApiResponse<Notification[]>> {
    try {
      const offset = (page - 1) * limit;

      const whereConditions: WhereOptions<Notification> = {
        userId: currentUser.id,
      };

      if (isRead !== undefined) {
        whereConditions.isRead = isRead;
      }

      if (type) {
        whereConditions.type = type;
      }

      const queryOptions: FindAndCountOptions<Notification> = {
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const { count, rows: notifications } =
        await Notification.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<Notification[]>({
        message: 'Notifications retrieved successfully',
        response: notifications,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to retrieve notifications');
    }
  }

  async getAllNotifications(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: NotificationType,
    isRead?: boolean,
    userId?: string,
  ): Promise<ApiResponse<Notification[]>> {
    try {
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions: WhereOptions<Notification> = {};

      // Search functionality
      if (search) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { message: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Filter by type
      if (type) {
        whereConditions.type = type;
      }

      // Filter by read status
      if (isRead !== undefined) {
        whereConditions.isRead = isRead;
      }

      // Filter by user
      if (userId) {
        whereConditions.userId = userId;
      }

      const queryOptions: FindAndCountOptions<Notification> = {
        where: whereConditions,
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const { count, rows: notifications } =
        await Notification.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<Notification[]>({
        message: 'Notifications retrieved successfully',
        response: notifications,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to retrieve notifications');
    }
  }

  async markAsRead(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Notification>> {
    try {
      const notification = await Notification.findOne({ where: { id } });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        notification.userId !== currentUser.id
      ) {
        throw new ForbiddenException(
          'You can only mark your own notifications as read',
        );
      }

      notification.markAsRead();

      return this.responseHelper.success<Notification>({
        message: 'Notification marked as read',
        response: notification,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to mark notification as read');
    }
  }

  async markAllAsRead(
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<void>> {
    try {
      await Notification.update(
        {
          isRead: true,
          readAt: new Date(),
        },
        {
          where: {
            userId: currentUser.id,
            isRead: false,
          },
        },
      );

      return this.responseHelper.success<void>({
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<void>> {
    try {
      const notification = await Notification.findOne({ where: { id } });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        notification.userId !== currentUser.id
      ) {
        throw new ForbiddenException(
          'You can only delete your own notifications',
        );
      }

      await notification.destroy();

      return this.responseHelper.success<void>({
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete notification');
    }
  }

  async getUnreadCount(
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<{ count: number }>> {
    try {
      const count = await Notification.count({
        where: {
          userId: currentUser.id,
          isRead: false,
        },
      });

      return this.responseHelper.success<{ count: number }>({
        message: 'Unread count retrieved successfully',
        response: { count },
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to get unread count');
    }
  }

  // Helper method to create system notifications
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    entityId?: string,
    entityType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<Notification> {
    return Notification.create({
      id: uuidv4(),
      title,
      message,
      type,
      priority,
      entityId: entityId ?? undefined,
      entityType: entityType ?? undefined,
      metadata: metadata ?? {},
      userId,
    });
  }
}
