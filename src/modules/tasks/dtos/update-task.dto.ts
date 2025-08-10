import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsInt, Min, Max } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { Type } from 'class-transformer';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    example: '2025-08-15T14:30:00.000Z',
    required: false,
    description: 'Task completion date in ISO format',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiProperty({
    example: 6,
    required: false,
    description: 'Actual hours spent on the task',
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  actualHours?: number;
}
