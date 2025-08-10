/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AllowNull,
  Unique,
  Index,
} from 'sequelize-typescript';
import { RoleType } from '@/common/enums';
import { Organization } from './organization.model';
import { Task } from './task.model';
import { TaskComment } from './task-comment.model';
import { AuditLog } from './audit-logs.model';
import { UserSession } from './user-session.model';
import { Notification } from './notification.model';
import { UserCreationAttributes } from '@/modules/auth/interfaces';

@Table({
  tableName: 'users',
  paranoid: true,
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['organizationId'] },
    { fields: ['role'] },
    { fields: ['isActive'] },
  ],
})
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare lastName: string;

  @AllowNull(false)
  @Unique
  @Index
  @Column(DataType.STRING(100))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @AllowNull(false)
  @Default(RoleType.USER)
  @Column(DataType.ENUM(...Object.values(RoleType)))
  declare role: RoleType;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare avatar: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  declare phone: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  declare jobTitle: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  declare department: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isEmailVerified: boolean;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare lastLoginAt: Date;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare emailVerificationToken: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare emailVerificationExpires: Date;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare resetPasswordToken: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare resetPasswordExpires: Date;

  @ForeignKey(() => Organization)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare organizationId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  // Associations
  @BelongsTo(() => Organization)
  declare organization: Organization;

  @HasMany(() => Task, 'assignedUserId')
  declare assignedTasks: Task[];

  @HasMany(() => Task, 'createdById')
  declare createdTasks: Task[];

  @HasMany(() => TaskComment)
  declare comments: TaskComment[];

  @HasMany(() => AuditLog)
  declare auditLogs: AuditLog[];

  @HasMany(() => UserSession)
  declare sessions: UserSession[];

  @HasMany(() => Notification)
  declare notifications: Notification[];
}
