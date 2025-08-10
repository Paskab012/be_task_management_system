/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Organization, User } from '@/database/models';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from '@/common/helpers/response.helper';
import { v4 as uuidv4 } from 'uuid';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { AuthenticatedUser } from '@/modules/auth/interfaces';
import { RoleType } from '@/common/enums';

@Injectable()
export class OrganizationsService {
  constructor(private readonly responseHelper: ResponseHelper) {}

  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
    currentUser?: AuthenticatedUser,
  ): Promise<ApiResponse<Organization>> {
    console.log('🚀 CREATE ORGANIZATION SERVICE REACHED');
    console.log('📝 DTO received:', createOrganizationDto);

    try {
      // Check if organization name already exists
      const existingOrganization = await Organization.findOne({
        where: { name: createOrganizationDto.name },
      });

      if (existingOrganization) {
        throw new ConflictException(
          'Organization with this name already exists',
        );
      }

      // Create organization
      const organization = await Organization.create({
        id: uuidv4(),
        name: createOrganizationDto.name,
        description: createOrganizationDto.description ?? undefined,
        logo: createOrganizationDto.logo ?? undefined,
        website: createOrganizationDto.website ?? undefined,
        phone: createOrganizationDto.phone ?? undefined,
        address: createOrganizationDto.address ?? undefined,
        settings: createOrganizationDto.settings ?? {},
        isActive: createOrganizationDto.isActive ?? true,
      });

      console.log('✅ Organization created successfully:', organization.id);

      return this.responseHelper.success<Organization>({
        message: 'Organization created successfully',
        response: organization,
      });
    } catch (error) {
      console.log('💥 CREATE ORGANIZATION ERROR:', error);

      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create organization');
    }
  }

  async getAllOrganizations(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ): Promise<ApiResponse<Organization[]>> {
    try {
      const offset = (page - 1) * limit;

      const whereConditions: WhereOptions<Organization> = {};

      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (isActive !== undefined) {
        whereConditions.isActive = isActive;
      }

      const queryOptions: FindAndCountOptions<Organization> = {
        where: whereConditions,
        include: [
          {
            association: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
            required: false,
          },
          {
            association: 'boards',
            attributes: ['id', 'name', 'visibility', 'status'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const { count, rows: organizations } =
        await Organization.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<Organization[]>({
        message: 'Organizations retrieved successfully',
        response: organizations,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('💥 GET ORGANIZATIONS ERROR:', error);
      throw new BadRequestException('Failed to retrieve organizations');
    }
  }

  async getOrganizationById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Organization>> {
    try {
      const organization = await Organization.findOne({
        where: { id },
        include: [
          {
            association: 'users',
            attributes: [
              'id',
              'firstName',
              'lastName',
              'email',
              'role',
              'isActive',
            ],
            required: false,
          },
          {
            association: 'boards',
            attributes: ['id', 'name', 'visibility', 'status', 'createdAt'],
            required: false,
          },
        ],
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        currentUser.organizationId !== organization.id
      ) {
        throw new ForbiddenException('Access denied to this organization');
      }

      return this.responseHelper.success<Organization>({
        message: 'Organization retrieved successfully',
        response: organization,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve organization');
    }
  }

  async updateOrganization(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Organization>> {
    console.log('🔄 UPDATE ORGANIZATION SERVICE REACHED');
    console.log('📝 Organization ID:', id);
    console.log('📝 Update DTO received:', updateOrganizationDto);

    try {
      const organization = await Organization.findOne({ where: { id } });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      if (
        updateOrganizationDto.name &&
        updateOrganizationDto.name !== organization.name
      ) {
        const existingOrganization = await Organization.findOne({
          where: {
            name: updateOrganizationDto.name,
            id: { [Op.ne]: id },
          },
        });

        if (existingOrganization) {
          throw new ConflictException(
            'Organization with this name already exists',
          );
        }
      }

      const updateData: Partial<Organization> = {
        ...updateOrganizationDto,
        updatedAt: new Date(),
      };

      await organization.update(updateData);

      const updatedOrganization = await Organization.findOne({
        where: { id },
        include: [
          {
            association: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
            required: false,
          },
        ],
      });

      return this.responseHelper.success<Organization>({
        message: 'Organization updated successfully',
        response: updatedOrganization!,
      });
    } catch (error) {
      console.log('💥 UPDATE ORGANIZATION ERROR:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update organization');
    }
  }

  async deleteOrganization(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<void>> {
    try {
      const organization = await Organization.findOne({ where: { id } });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      const activeUsersCount = await User.count({
        where: { organizationId: id, isActive: true },
      });

      if (activeUsersCount > 0) {
        throw new BadRequestException(
          'Cannot delete organization with active users. Please deactivate all users first.',
        );
      }

      await organization.update({
        isActive: false,
        deletedAt: new Date(),
      });

      return this.responseHelper.success<void>({
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete organization');
    }
  }

  async toggleOrganizationStatus(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Organization>> {
    try {
      const organization = await Organization.findOne({ where: { id } });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Toggle active status
      await organization.update({
        isActive: !organization.isActive,
        updatedAt: new Date(),
      });

      const updatedOrganization = await Organization.findOne({
        where: { id },
        include: [
          {
            association: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
            required: false,
          },
        ],
      });

      return this.responseHelper.success<Organization>({
        message: `Organization ${updatedOrganization!.isActive ? 'activated' : 'deactivated'} successfully`,
        response: updatedOrganization!,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle organization status');
    }
  }

  async getOrganizationUsers(
    id: string,
    page: number = 1,
    limit: number = 10,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<User[]>> {
    try {
      const organization = await Organization.findOne({ where: { id } });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        currentUser.organizationId !== organization.id
      ) {
        throw new ForbiddenException('Access denied to this organization');
      }

      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        where: { organizationId: id },
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<User[]>({
        message: 'Organization users retrieved successfully',
        response: users,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve organization users');
    }
  }
}
