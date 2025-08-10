/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@/database/models';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from './interfaces/response.interface';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { FindAndCountOptions, Op } from 'sequelize';

@Injectable()
export class UsersService {
  constructor(
    private readonly responseHelper: ResponseHelper,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    console.log('🚀 CREATE USER SERVICE REACHED');
    console.log('📝 DTO received:', createUserDto);
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: createUserDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds =
        Number(this.configService.get<string>('SALT_ROUNDS')) || 12;
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      // Create user
      const user = await User.create({
        id: uuidv4(),
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword,
        role: createUserDto.role,
        phone: createUserDto.phone || null,
        jobTitle: createUserDto.jobTitle || null,
        department: createUserDto.department || null,
        isEmailVerified: createUserDto.isEmailVerified ?? false,
        isActive: createUserDto.isActive ?? true,
        organizationId: createUserDto.organizationId || null,
        lastLoginAt: null,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      // Remove password from response
      const { password, ...userResponse } = user.toJSON();

      return this.responseHelper.success<User>({
        message: 'User created successfully',
        response: userResponse as User,
      });
    } catch (error) {
      console.log('💥 CREATE USER ERROR:', error);

      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<ApiResponse<User[]>> {
    try {
      const offset = (page - 1) * limit;

      // Build the query options
      const queryOptions: FindAndCountOptions = {
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      // Add search condition if provided
      if (search) {
        queryOptions.where = {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      const { count, rows: users } = await User.findAndCountAll(queryOptions);

      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<User[]>({
        message: 'Users retrieved successfully',
        response: users,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.responseHelper.success<User>({
        message: 'User retrieved successfully',
        response: user,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    console.log('🔄 UPDATE USER SERVICE REACHED');
    console.log('📝 User ID:', id);
    console.log('📝 Update DTO received:', updateUserDto);

    try {
      console.log('🔍 Looking for user with ID:', id);
      const user = await User.findOne({ where: { id } });

      if (!user) {
        console.log('❌ User not found with ID:', id);
        throw new NotFoundException('User not found');
      }

      console.log('✅ User found:', { id: user.id, email: user.email });

      // Check if email is being updated and already exists
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        console.log('📧 Checking email uniqueness for:', updateUserDto.email);

        const existingUser = await User.findOne({
          where: {
            email: updateUserDto.email.toLowerCase(),
            id: { [Op.ne]: id },
          },
        });

        if (existingUser) {
          console.log('❌ Email already exists for another user');
          throw new ConflictException('User with this email already exists');
        }

        console.log('✅ Email is unique');
      }

      // Create a copy of the DTO to avoid mutation issues
      const updateData = { ...updateUserDto };

      // Hash password if provided
      if (updateData.password) {
        console.log('🔒 Hashing password...');
        try {
          const saltRounds =
            Number(this.configService.get<string>('SALT_ROUNDS')) || 12;

          console.log('🧂 Salt rounds:', saltRounds);

          const hashedPassword = await bcrypt.hash(
            updateData.password,
            saltRounds,
          );
          updateData.password = hashedPassword;

          console.log('✅ Password hashed successfully');
        } catch (hashError) {
          console.log('💥 Password hashing error:', hashError);
          throw new BadRequestException('Failed to hash password');
        }
      }

      console.log('💾 Updating user in database...');

      // Update user with the processed data
      await user.update({
        ...updateData,
        email: updateData.email?.toLowerCase() || user.email,
        updatedAt: new Date(),
      });

      console.log('✅ User updated successfully in database');

      console.log('🔍 Fetching updated user...');

      // Get updated user without password
      const updatedUser = await User.findOne({
        where: { id },
        attributes: { exclude: ['password'] },
      });

      if (!updatedUser) {
        console.log('❌ Updated user not found after update');
        throw new BadRequestException('Failed to retrieve updated user');
      }

      console.log('✅ Updated user retrieved successfully');

      const response = this.responseHelper.success<User>({
        message: 'User updated successfully',
        response: updatedUser,
      });

      console.log('✅ UPDATE USER COMPLETED SUCCESSFULLY');
      return response;
    } catch (error) {
      console.log('💥 UPDATE USER ERROR:', error);
      console.log('📚 Error details:', {
        name: error,
      });

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      const user = await User.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await user.destroy({ force: true });

      return this.responseHelper.success<void>({
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }

  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    try {
      const user = await User.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await user.update({
        isActive: !user.isActive,
        updatedAt: new Date(),
      });

      const updatedUser = await User.findOne({
        where: { id },
        attributes: { exclude: ['password'] },
      });

      return this.responseHelper.success<User>({
        message: `User ${updatedUser!.isActive ? 'activated' : 'deactivated'} successfully`,
        response: updatedUser!,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle user status');
    }
  }
}
