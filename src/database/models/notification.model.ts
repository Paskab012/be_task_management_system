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
  UpdatedAt,
  AllowNull,
  Index,
} from 'sequelize-typescript';
import { User } from './user.model';

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  TASK_OVERDUE = 'task_overdue',
  COMMENT_ADDED = 'comment_added',
  BOARD_SHARED = 'board_shared',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Table({
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['type'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] },
  ],
})
export class Notification extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  message: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(NotificationType)))
  type: NotificationType;

  @AllowNull(false)
  @Default(NotificationPriority.NORMAL)
  @Column(DataType.ENUM(...Object.values(NotificationPriority)))
  priority: NotificationPriority;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isRead: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  readAt: Date;

  @AllowNull(true)
  @Column(DataType.UUID)
  entityId: string;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  entityType: string;

  @AllowNull(true)
  @Default({})
  @Column(DataType.JSONB)
  metadata: Record<string, any>;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  userId: string;

  @CreatedAt
  declarecreatedAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Associations
  @BelongsTo(() => User)
  user: User;

  // Instance methods
  markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }
}
