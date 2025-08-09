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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { Notification } from '@/database/models';
import { ApiResponse as ApiResponseType } from '@/common/helpers/response.helper';
import { AuthenticatedUser } from '@/modules/auth/interfaces';
import { NotificationType } from '@/database/models/notification.model';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification created successfully',
  })
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Notification>> {
    return this.notificationsService.createNotification(
      createNotificationDto,
      currentUser,
    );
  }

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get all notifications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'task' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  @ApiQuery({ name: 'isRead', required: false, example: false })
  @ApiQuery({ name: 'userId', required: false, example: 'user-uuid' })
  async getAllNotifications(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('type') type?: NotificationType,
    @Query('isRead') isRead?: string,
    @Query('userId') userId?: string,
  ): Promise<ApiResponseType<Notification[]>> {
    const isReadBoolean =
      isRead === 'true' ? true : isRead === 'false' ? false : undefined;

    return this.notificationsService.getAllNotifications(
      parseInt(page),
      parseInt(limit),
      search,
      type,
      isReadBoolean,
      userId,
    );
  }

  @Get('my-notifications')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'isRead', required: false, example: false })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  async getMyNotifications(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('isRead') isRead?: string,
    @Query('type') type?: NotificationType,
  ): Promise<ApiResponseType<Notification[]>> {
    const isReadBoolean =
      isRead === 'true' ? true : isRead === 'false' ? false : undefined;

    return this.notificationsService.getMyNotifications(
      currentUser,
      parseInt(page),
      parseInt(limit),
      isReadBoolean,
      type,
    );
  }

  @Get('unread-count')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get unread notifications count for current user' })
  async getUnreadCount(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<{ count: number }>> {
    return this.notificationsService.getUnreadCount(currentUser);
  }

  @Patch(':id/mark-as-read')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Notification>> {
    return this.notificationsService.markAsRead(id, currentUser);
  }

  @Patch('mark-all-read')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAllAsRead(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<void>> {
    return this.notificationsService.markAllAsRead(currentUser);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin', 'user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<void>> {
    return this.notificationsService.deleteNotification(id, currentUser);
  }
}
