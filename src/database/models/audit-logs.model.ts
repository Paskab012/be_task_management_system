import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  AllowNull,
  Index,
} from 'sequelize-typescript';
import { User } from './user.model';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  SHARE = 'share',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
}

export enum AuditEntityType {
  USER = 'user',
  ORGANIZATION = 'organization',
  BOARD = 'board',
  TASK = 'task',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  NOTIFICATION = 'notification',
  AUTH = 'auth',
  SYSTEM = 'system',
}

interface AuditLogCreationAttributes {
  id?: string;
  action: AuditAction;
  entity: AuditEntityType;
  entityId?: string;
  description?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

@Table({
  tableName: 'audit_logs',
  timestamps: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['entity'] },
    { fields: ['action'] },
    { fields: ['entityId'] },
    { fields: ['createdAt'] },
  ],
})
export class AuditLog extends Model<AuditLog, AuditLogCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(AuditAction)))
  declare action: AuditAction;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(AuditEntityType)))
  declare entity: AuditEntityType;

  @AllowNull(true)
  @Index
  @Column(DataType.UUID)
  declare entityId: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare oldValues: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare newValues: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.STRING(45))
  declare ipAddress: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare userAgent: string | null;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.UUID)
  declare userId: string | null;

  @CreatedAt
  declare createdAt: Date;

  // Associations
  @BelongsTo(() => User)
  declare user: User | null;
}
