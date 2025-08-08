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
  DeletedAt,
  AllowNull,
  Index,
} from 'sequelize-typescript';
import { Task } from './task.model';
import { User } from './user.model';

@Table({
  tableName: 'task_comments',
  paranoid: true,
  timestamps: true,
  indexes: [
    { fields: ['taskId'] },
    { fields: ['userId'] },
    { fields: ['createdAt'] },
  ],
})
export class TaskComment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declareid: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content: string;

  @AllowNull(true)
  @Default({})
  @Column(DataType.JSONB)
  metadata: Record<string, any>;

  @ForeignKey(() => Task)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  taskId: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  userId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declareupdatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  // Associations
  @BelongsTo(() => Task)
  task: Task;

  @BelongsTo(() => User)
  user: User;
}
