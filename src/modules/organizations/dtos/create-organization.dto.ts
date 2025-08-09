import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
  IsUrl,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Organization name',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Leading software development company',
    description: 'Organization description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Organization logo URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({
    example: 'https://acmecorp.com',
    description: 'Organization website',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Organization phone number',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    example: '123 Business Street, City, State 12345',
    description: 'Organization address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: { allowPublicBoards: true, defaultTaskPriority: 'medium' },
    description: 'Organization settings',
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiProperty({
    example: true,
    description: 'Organization active status',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
