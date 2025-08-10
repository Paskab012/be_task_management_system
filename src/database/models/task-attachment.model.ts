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
  tableName: 'task_attachments',
  paranoid: true,
  timestamps: true,
  indexes: [{ fields: ['taskId'] }, { fields: ['uploadedById'] }],
})
export class TaskAttachment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declareid: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  originalName: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  fileName: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  filePath: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  mimeType: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  fileSize: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @ForeignKey(() => Task)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  taskId: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  uploadedById: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  // Associations
  @BelongsTo(() => Task)
  task: Task;

  @BelongsTo(() => User)
  uploadedBy: User;
}
