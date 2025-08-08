import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Board } from './board.model';

@Table({
  tableName: 'organizations',
  paranoid: true, // Enables soft deletes
  timestamps: true,
})
export class Organization extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declareid: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(100))
  name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  logo: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  website: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  phone: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  address: string;

  @AllowNull(true)
  @Default({})
  @Column(DataType.JSONB)
  settings: Record<string, any>;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @CreatedAt
  declarecreatedAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  // Associations
  @HasMany(() => User)
  users: User[];

  @HasMany(() => Board)
  boards: Board[];
}
