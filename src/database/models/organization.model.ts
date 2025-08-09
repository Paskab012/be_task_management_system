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

interface OrganizationCreationAttributes {
  id?: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  phone?: string;
  address?: string;
  settings?: Record<string, unknown>;
  isActive?: boolean;
}

@Table({
  tableName: 'organizations',
  paranoid: true,
  timestamps: true,
})
export class Organization extends Model<
  Organization,
  OrganizationCreationAttributes
> {
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
  declare settings: Record<string, unknown>;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;

  // Associations
  @HasMany(() => User)
  declare users: User[];

  @HasMany(() => Board)
  declare boards: Board[];
}
