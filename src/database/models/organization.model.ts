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
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(100))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare logo: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  declare website: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  declare phone: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare address: string;

  @AllowNull(true)
  @Default({})
  @Column(DataType.JSONB)
  declare settings: Record<string, any>;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  // Associations
  @HasMany(() => User)
  declare users: User[];

  @HasMany(() => Board)
  declare boards: Board[];
}
