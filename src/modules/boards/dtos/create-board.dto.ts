import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  MaxLength,
  IsInt,
  IsObject,
  Min,
} from 'class-validator';
import { BoardVisibility, BoardStatus } from '@/common/enums';
import { Type } from 'class-transformer';

export class CreateBoardDto {
  @ApiProperty({ example: 'Project Alpha', description: 'Board name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Main project board for tracking development tasks',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: BoardVisibility,
    example: BoardVisibility.PRIVATE,
    description: 'Board visibility',
    required: false,
    default: BoardVisibility.PRIVATE,
  })
  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility;

  @ApiProperty({
    enum: BoardStatus,
    example: BoardStatus.ACTIVE,
    description: 'Board status',
    required: false,
    default: BoardStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BoardStatus)
  status?: BoardStatus;

  @ApiProperty({ example: '#3498db', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'project', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: { allowComments: true, autoArchive: false },
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({ example: 'org-uuid', required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;
}
