/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '@/common/guards';
import { Roles, Public } from '@/common/decorators';
import { User } from '@/database/models';
import { ApiResponse as ApiResponseType } from './interfaces/response.interface';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Roles('super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Super Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponseType<User>> {
    console.log('🎯 CREATE USER CONTROLLER REACHED');
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ): Promise<ApiResponseType<User[]>> {
    return this.userService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      search,
    );
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserById(@Param('id') id: string): Promise<ApiResponseType<User>> {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update user by ID (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponseType<User>> {
    console.log('🎯 UPDATE USER CONTROLLER REACHED');
    console.log('📝 ID:', id);
    console.log('📝 DTO:', updateUserDto);
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async deleteUser(@Param('id') id: string): Promise<ApiResponseType<void>> {
    return this.userService.deleteUser(id);
  }

  @Patch(':id/toggle-status')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Toggle user active status (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async toggleUserStatus(
    @Param('id') id: string,
  ): Promise<ApiResponseType<User>> {
    return this.userService.toggleUserStatus(id);
  }

  @Post('test')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Test public endpoint' })
  async createUserTest(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponseType<User>> {
    console.log('🎯 CREATE USER CONTROLLER REACHED');
    return this.userService.createUser(createUserDto);
  }

  @Post('test-auth')
  @SetMetadata('skipPermissions', true)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Test auth-only endpoint' })
  async testAuthOnly(@Body() createUserDto: CreateUserDto) {
    console.log('🔐 AUTH-ONLY TEST ENDPOINT REACHED');
    return { message: 'Auth-only endpoint working', data: createUserDto };
  }
}
