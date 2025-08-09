import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '@/common/enums';

export class UserDataDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  readonly firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  readonly lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  readonly email: string;

  @ApiProperty({
    description: 'User role',
    enum: RoleType,
    example: RoleType.USER,
  })
  readonly role: RoleType;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  readonly avatar: string | null;

  @ApiProperty({
    description: 'Whether user email is verified',
    example: true,
  })
  readonly isEmailVerified: boolean;

  @ApiProperty({
    description: 'Whether user account is active',
    example: true,
  })
  readonly isActive: boolean;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  readonly fullName: string;

  @ApiProperty({
    description: 'Organization ID if user belongs to an organization',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  readonly organizationId: string | null;

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-08-08T12:00:00.000Z',
  })
  readonly createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  readonly expiresIn: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  readonly tokenType: string;

  @ApiProperty({
    description: 'Authenticated user data',
    type: UserDataDto,
  })
  readonly user: UserDataDto;
}
