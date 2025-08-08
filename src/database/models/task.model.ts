/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  Index,
} from 'sequelize-typescript';
import { TaskStatus, TaskPriority } from '@/common/enums';
import { Board } from './board.model';
import { User } from './user.model';
import { TaskComment } from './task-comment.model';
import { TaskAttachment } from './task-attachment.model';

@Table({
  tableName: 'tasks',
  paranoid: true,
  timestamps: true,
  indexes: [
    { fields: ['boardId'] },
    { fields: ['assignedUserId'] },
    { fields: ['createdById'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['dueDate'] },
  ],
})
export class Task extends Model<Task> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  declare title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Default(TaskStatus.TODO)
  @Column(DataType.ENUM(...Object.values(TaskStatus)))
  declare status: TaskStatus;

  @AllowNull(false)
  @Default(TaskPriority.MEDIUM)
  @Column(DataType.ENUM(...Object.values(TaskPriority)))
  declare priority: TaskPriority;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare dueDate: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare startDate: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare completedAt: Date;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare estimatedHours: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare actualHours: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare position: number;

  @AllowNull(true)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  @AllowNull(true)
  @Default({})
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @ForeignKey(() => Board)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare boardId: string;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.UUID)
  declare assignedUserId: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare createdById: string;

  @ForeignKey(() => Task)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare parentTaskId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  // Associations
  @BelongsTo(() => Board)
  declare board: Board;

  @BelongsTo(() => User, 'assignedUserId')
  declare assignedUser: User;

  @BelongsTo(() => User, 'createdById')
  declare createdBy: User;

  @BelongsTo(() => Task, 'parentTaskId')
  declare parentTask: Task;

  @HasMany(() => Task, 'parentTaskId')
  declare subTasks: Task[];

  @HasMany(() => TaskComment)
  declare comments: TaskComment[];

  @HasMany(() => TaskAttachment)
  declare attachments: TaskAttachment[];
}
