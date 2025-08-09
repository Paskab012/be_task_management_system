import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({
    example: 'Updated comment content',
    description: 'Updated comment content',
    required: false,
  })
  content?: string;
}
