import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '@/common/guards';
import { Roles } from '@/common/decorators';
import { AuditLog } from '@/database/models';
import { ApiResponse as ApiResponseType } from '@/common/helpers/response.helper';
import {
  AuditAction,
  AuditEntityType,
} from '@/database/models/audit-logs.model';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get all audit logs (Super Admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: '192.168.1.1' })
  @ApiQuery({
    name: 'action',
    required: false,
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: AuditEntityType,
    example: AuditEntityType.USER,
  })
  @ApiQuery({ name: 'entityId', required: false, example: 'entity-uuid' })
  @ApiQuery({ name: 'userId', required: false, example: 'user-uuid' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-12-31' })
  async getAllAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: AuditEntityType,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponseType<AuditLog[]>> {
    return this.auditLogsService.getAllAuditLogs(
      parseInt(page),
      parseInt(limit),
      search,
      action,
      entityType,
      entityId,
      userId,
      startDate,
      endDate,
    );
  }

  @Get('stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get audit log statistics (Super Admin only)' })
  async getAuditStats(): Promise<ApiResponseType<Record<string, unknown>>> {
    return this.auditLogsService.getAuditStats();
  }

  @Get(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get audit log by ID (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Audit Log ID' })
  async getAuditLogById(
    @Param('id') id: string,
  ): Promise<ApiResponseType<AuditLog>> {
    return this.auditLogsService.getAuditLogById(id);
  }

  @Get('user/:userId')
  @Roles('super_admin', 'admin')
  @ApiOperation({
    summary: 'Get audit logs for a specific user (Admin/Super Admin only)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'action',
    required: false,
    enum: AuditAction,
    example: AuditAction.LOGIN,
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: AuditEntityType,
    example: AuditEntityType.AUTH,
  })
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: AuditEntityType,
  ): Promise<ApiResponseType<AuditLog[]>> {
    return this.auditLogsService.getUserAuditLogs(
      userId,
      parseInt(page),
      parseInt(limit),
      action,
      entityType,
    );
  }

  @Get('entity/:entityType/:entityId')
  @Roles('super_admin', 'admin')
  @ApiOperation({
    summary: 'Get audit logs for a specific entity (Admin/Super Admin only)',
  })
  @ApiParam({
    name: 'entityType',
    enum: AuditEntityType,
    description: 'Entity type',
  })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getEntityAuditLogs(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<ApiResponseType<AuditLog[]>> {
    return this.auditLogsService.getEntityAuditLogs(
      entityType,
      entityId,
      parseInt(page),
      parseInt(limit),
    );
  }
}
