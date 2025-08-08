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
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW = 'view',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
}

export enum AuditEntity {
  USER = 'user',
  ORGANIZATION = 'organization',
  BOARD = 'board',
  TASK = 'task',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  AUTH = 'auth',
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
export class AuditLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declareid: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(AuditAction)))
  action: AuditAction;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(AuditEntity)))
  entity: AuditEntity;

  @AllowNull(true)
  @Column(DataType.UUID)
  entityId: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(true)
  @Column(DataType.JSONB)
  oldValues: Record<string, any>;

  @AllowNull(true)
  @Column(DataType.JSONB)
  newValues: Record<string, any>;

  @AllowNull(true)
  @Column(DataType.STRING(45))
  ipAddress: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  userAgent: string;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.UUID)
  userId: string;

  @CreatedAt
  declare createdAt: Date;

  // Associations
  @BelongsTo(() => User)
  user: User;
}
