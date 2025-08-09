import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This task looks great! I have a few suggestions.',
    description: 'Comment content',
    maxLength: 2000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiProperty({
    example: { mentions: ['user-id-1'], attachments: [] },
    required: false,
    description: 'Additional comment metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: 'task-uuid',
    description: 'Task ID to comment on',
  })
  @IsNotEmpty()
  @IsUUID()
  taskId: string;
}
