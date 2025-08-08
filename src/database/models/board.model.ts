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
import { BoardVisibility, BoardStatus } from '@/common/enums';
import { Organization } from './organization.model';
import { User } from './user.model';
import { Task } from './task.model';

@Table({
  tableName: 'boards',
  paranoid: true,
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['visibility'] },
    { fields: ['status'] },
    { fields: ['createdById'] },
  ],
})
export class Board extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Default(BoardVisibility.PRIVATE)
  @Column(DataType.ENUM(...Object.values(BoardVisibility)))
  visibility: BoardVisibility;

  @AllowNull(false)
  @Default(BoardStatus.ACTIVE)
  @Column(DataType.ENUM(...Object.values(BoardStatus)))
  status: BoardStatus;

  @AllowNull(true)
  @Column(DataType.STRING)
  color: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  icon: string;

  @AllowNull(true)
  @Default({})
  @Column(DataType.JSONB)
  settings: Record<string, any>;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  position: number;

  @ForeignKey(() => Organization)
  @AllowNull(true)
  @Index
  @Column(DataType.UUID)
  organizationId: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  createdById: string;

  @CreatedAt
  declarecreatedAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  // Associations
  @BelongsTo(() => Organization)
  organization: Organization;

  @BelongsTo(() => User, 'createdById')
  createdBy: User;

  @HasMany(() => Task)
  tasks: Task[];
}
