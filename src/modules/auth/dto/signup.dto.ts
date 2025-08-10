import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  readonly firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  readonly lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;

  @ApiProperty({
    description:
      'User password (must contain at least one uppercase letter, one lowercase letter, one number, and one special character)',
    example: 'Password@123',
    minLength: 8,
    format: 'password',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  readonly password: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+250788123456',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  readonly phone?: string;

  @ApiProperty({
    description: 'User job title',
    example: 'Software Developer',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
  @MaxLength(100, { message: 'Job title must not exceed 100 characters' })
  readonly jobTitle?: string;

  @ApiProperty({
    description: 'User department',
    example: 'Engineering',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  readonly department?: string;
}
