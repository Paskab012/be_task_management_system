import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';
import {
  NotificationType,
  NotificationPriority,
} from '@/database/models/notification.model';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'New Task Assigned',
    description: 'Notification title',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'You have been assigned a new task: Implement user authentication',
    description: 'Notification message',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
    description: 'Type of notification',
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
    description: 'Notification priority',
    required: false,
    default: NotificationPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({
    example: 'task-uuid',
    description: 'Related entity ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({
    example: 'task',
    description: 'Related entity type',
    required: false,
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    example: { taskTitle: 'Implement auth', boardName: 'Development' },
    description: 'Additional notification metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: 'user-uuid',
    description: 'User to send notification to',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
