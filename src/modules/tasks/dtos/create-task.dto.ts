/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '@/common/enums';
import { Type, Transform } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Task title',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({
    example: 'Create login and signup functionality with JWT tokens',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Task status',
    required: false,
    default: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status?: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Task priority',
    required: false,
    default: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Invalid task priority' })
  priority?: TaskPriority;

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    required: false,
    description: 'Task due date in ISO format',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate?: string;

  @ApiProperty({
    example: '2025-08-10T09:00:00.000Z',
    required: false,
    description: 'Task start date in ISO format',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiProperty({
    example: 8.5,
    required: false,
    description: 'Estimated hours to complete the task',
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? Number(value) : undefined;
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Estimated hours must be a valid number' })
  @Min(0, { message: 'Estimated hours cannot be negative' })
  @Max(1000, { message: 'Estimated hours cannot exceed 1000' })
  estimatedHours?: number;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Position in the board',
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? Number(value) : undefined;
  })
  @Type(() => Number)
  @IsInt({ message: 'Position must be an integer' })
  @Min(0, { message: 'Position cannot be negative' })
  position?: number;

  @ApiProperty({
    example: ['frontend', 'authentication', 'urgent'],
    required: false,
    description: 'Task tags',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  })
  tags?: string[];

  @ApiProperty({
    example: { component: 'login', complexity: 'medium' },
    required: false,
    description: 'Additional task metadata',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  @Transform(({ value }) => {
    return value || {};
  })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: 'board-uuid',
    description: 'Board ID where the task belongs',
  })
  @IsNotEmpty({ message: 'Board ID is required' })
  @IsUUID('4', { message: 'Board ID must be a valid UUID' })
  boardId: string;

  @ApiProperty({
    example: 'user-uuid',
    required: false,
    description: 'User ID to assign the task to',
  })
  @IsOptional()
  @ValidateIf(
    (obj, value) => value !== undefined && value !== null && value !== '',
  )
  @IsUUID('4', { message: 'Assigned User ID must be a valid UUID' })
  @Transform(({ value }) => {
    if (value === 'unassigned' || value === '') return undefined;
    return value;
  })
  assignedUserId?: string;

  @ApiProperty({
    example: 'parent-task-uuid',
    required: false,
    description: 'Parent task ID for subtasks',
  })
  @IsOptional()
  @ValidateIf(
    (obj, value) => value !== undefined && value !== null && value !== '',
  )
  @IsUUID('4', { message: 'Parent Task ID must be a valid UUID' })
  parentTaskId?: string;
}
