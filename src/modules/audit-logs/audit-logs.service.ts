/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuditLog } from '@/database/models';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from '@/common/helpers/response.helper';
import { v4 as uuidv4 } from 'uuid';
import { FindAndCountOptions, WhereOptions, Op } from 'sequelize';
import {
  AuditAction,
  AuditEntityType,
} from '@/database/models/audit-logs.model';

interface AuditLogStatsByAction {
  action: AuditAction;
  count: string;
}

interface AuditLogStatsByEntityType {
  entity: AuditEntityType;
  count: string;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly responseHelper: ResponseHelper) {}

  async createAuditLog(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId?: string,
    description?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
    userId?: string,
  ): Promise<AuditLog> {
    try {
      return await AuditLog.create({
        id: uuidv4(),
        action,
        entity: entityType,
        entityId: entityId ?? undefined,
        description: description ?? undefined,
        oldValues: oldValues ?? undefined,
        newValues: newValues ?? undefined,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
        userId: userId ?? undefined,
      });
    } catch (error) {
      console.log('💥 CREATE AUDIT LOG ERROR:', error);
      throw new BadRequestException('Failed to create audit log');
    }
  }

  async getAllAuditLogs(
    page: number = 1,
    limit: number = 10,
    search?: string,
    action?: AuditAction,
    entityType?: AuditEntityType,
    entityId?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ApiResponse<AuditLog[]>> {
    try {
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions: WhereOptions<AuditLog> = {};

      // Filter by action
      if (action) {
        whereConditions.action = action;
      }

      // Filter by entity type
      if (entityType) {
        whereConditions.entity = entityType;
      }

      // Filter by entity ID
      if (entityId) {
        whereConditions.entityId = entityId;
      }

      // Filter by user ID
      if (userId) {
        whereConditions.userId = userId;
      }

      // Date range filter
      if (startDate || endDate) {
        const dateConditions: {
          [Op.gte]?: Date;
          [Op.lte]?: Date;
        } = {};

        if (startDate) {
          dateConditions[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          dateConditions[Op.lte] = new Date(endDate);
        }
        whereConditions.createdAt = dateConditions;
      }

      // Search functionality
      if (search) {
        whereConditions[Op.or] = [
          { description: { [Op.iLike]: `%${search}%` } },
          { ipAddress: { [Op.iLike]: `%${search}%` } },
          { userAgent: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const queryOptions: FindAndCountOptions<AuditLog> = {
        where: whereConditions,
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const { count, rows: auditLogs } =
        await AuditLog.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<AuditLog[]>({
        message: 'Audit logs retrieved successfully',
        response: auditLogs,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('💥 GET AUDIT LOGS ERROR:', error);
      throw new BadRequestException('Failed to retrieve audit logs');
    }
  }

  async getAuditLogById(id: string): Promise<ApiResponse<AuditLog>> {
    try {
      const auditLog = await AuditLog.findOne({
        where: { id },
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
      });

      if (!auditLog) {
        throw new NotFoundException('Audit log not found');
      }

      return this.responseHelper.success<AuditLog>({
        message: 'Audit log retrieved successfully',
        response: auditLog,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve audit log');
    }
  }

  async getUserAuditLogs(
    userId: string,
    page: number = 1,
    limit: number = 10,
    action?: AuditAction,
    entityType?: AuditEntityType,
  ): Promise<ApiResponse<AuditLog[]>> {
    try {
      const offset = (page - 1) * limit;

      const whereConditions: WhereOptions<AuditLog> = {
        userId,
      };

      if (action) {
        whereConditions.action = action;
      }

      if (entityType) {
        whereConditions.entity = entityType;
      }

      const queryOptions: FindAndCountOptions<AuditLog> = {
        where: whereConditions,
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const { count, rows: auditLogs } =
        await AuditLog.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<AuditLog[]>({
        message: 'User audit logs retrieved successfully',
        response: auditLogs,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('💥 GET USER AUDIT LOGS ERROR:', error);
      throw new BadRequestException('Failed to retrieve user audit logs');
    }
  }

  async getEntityAuditLogs(
    entityType: AuditEntityType,
    entityId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<AuditLog[]>> {
    try {
      const offset = (page - 1) * limit;

      const queryOptions: FindAndCountOptions<AuditLog> = {
        where: {
          entity: entityType,
          entityId,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const { count, rows: auditLogs } =
        await AuditLog.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<AuditLog[]>({
        message: 'Entity audit logs retrieved successfully',
        response: auditLogs,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('💥 GET ENTITY AUDIT LOGS ERROR:', error);
      throw new BadRequestException('Failed to retrieve entity audit logs');
    }
  }

  async getAuditStats(): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const totalLogs = await AuditLog.count();

      const logsByActionRaw = (await AuditLog.findAll({
        attributes: [
          'action',
          [
            AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('action')),
            'count',
          ],
        ],
        group: ['action'],
        raw: true,
      })) as unknown as AuditLogStatsByAction[];

      const logsByEntityTypeRaw = (await AuditLog.findAll({
        attributes: [
          'entity',
          [
            AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('entity')),
            'count',
          ],
        ],
        group: ['entity'],
        raw: true,
      })) as unknown as AuditLogStatsByEntityType[];

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentActivity = await AuditLog.count({
        where: {
          createdAt: { [Op.gte]: yesterday },
        },
      });

      const logsByAction = logsByActionRaw.reduce(
        (acc: Record<string, number>, item: AuditLogStatsByAction) => {
          acc[item.action] = parseInt(item.count, 10);
          return acc;
        },
        {},
      );

      const logsByEntityType = logsByEntityTypeRaw.reduce(
        (acc: Record<string, number>, item: AuditLogStatsByEntityType) => {
          acc[item.entity] = parseInt(item.count, 10);
          return acc;
        },
        {},
      );

      const stats = {
        totalLogs,
        recentActivity,
        logsByAction,
        logsByEntityType,
      };

      return this.responseHelper.success<Record<string, unknown>>({
        message: 'Audit statistics retrieved successfully',
        response: stats,
      });
    } catch (error) {
      console.log('💥 GET AUDIT STATS ERROR:', error);
      throw new BadRequestException('Failed to retrieve audit statistics');
    }
  }

  // Helper method for other services to easily create audit logs
  async logUserAction(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    userId: string,
    description?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.createAuditLog(
        action,
        entityType,
        entityId,
        description,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
        userId,
      );
    } catch (error) {
      console.log('💥 AUDIT LOG CREATION FAILED:', error);
    }
  }
}
