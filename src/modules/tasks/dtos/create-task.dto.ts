import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  MaxLength,
  IsInt,
  IsArray,
  IsObject,
  IsDateString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '@/common/enums';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Task title',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Create login and signup functionality with JWT tokens',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Task status',
    required: false,
    default: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Task priority',
    required: false,
    default: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    required: false,
    description: 'Task due date in ISO format',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    example: '2025-08-10T09:00:00.000Z',
    required: false,
    description: 'Task start date in ISO format',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: 8,
    required: false,
    description: 'Estimated hours to complete the task',
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  estimatedHours?: number;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Position in the board',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({
    example: ['frontend', 'authentication', 'urgent'],
    required: false,
    description: 'Task tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: { component: 'login', complexity: 'medium' },
    required: false,
    description: 'Additional task metadata',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: 'board-uuid',
    description: 'Board ID where the task belongs',
  })
  @IsNotEmpty()
  @IsUUID()
  boardId: string;

  @ApiProperty({
    example: 'user-uuid',
    required: false,
    description: 'User ID to assign the task to',
  })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiProperty({
    example: 'parent-task-uuid',
    required: false,
    description: 'Parent task ID for subtasks',
  })
  @IsOptional()
  @IsUUID()
  parentTaskId?: string;
}
