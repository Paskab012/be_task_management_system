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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { Organization, User } from '@/database/models';
import { ApiResponse as ApiResponseType } from '@/common/helpers/response.helper';
import { AuthenticatedUser } from '@/modules/auth/interfaces';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new organization (Super Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization created successfully',
  })
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Organization>> {
    return this.organizationsService.createOrganization(
      createOrganizationDto,
      currentUser,
    );
  }

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get all organizations (Admin/Super Admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'acme' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  async getAllOrganizations(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ApiResponseType<Organization[]>> {
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.organizationsService.getAllOrganizations(
      parseInt(page),
      parseInt(limit),
      search,
      isActiveBoolean,
    );
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async getOrganizationById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Organization>> {
    return this.organizationsService.getOrganizationById(id, currentUser);
  }

  @Get(':id/users')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get organization users' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getOrganizationUsers(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<User[]>> {
    return this.organizationsService.getOrganizationUsers(
      id,
      parseInt(page),
      parseInt(limit),
      currentUser,
    );
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update organization by ID (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Organization>> {
    return this.organizationsService.updateOrganization(
      id,
      updateOrganizationDto,
      currentUser,
    );
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete organization by ID (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async deleteOrganization(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<void>> {
    return this.organizationsService.deleteOrganization(id, currentUser);
  }

  @Patch(':id/toggle-status')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Toggle organization status (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async toggleOrganizationStatus(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Organization>> {
    return this.organizationsService.toggleOrganizationStatus(id, currentUser);
  }
}
