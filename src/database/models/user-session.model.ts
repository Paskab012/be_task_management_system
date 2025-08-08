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

@Table({
  tableName: 'user_sessions',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['refreshToken'] },
    { fields: ['isActive'] },
    { fields: ['expiresAt'] },
  ],
})
export class UserSession extends Model<UserSession> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Index
  @Column(DataType.TEXT)
  declare refreshToken: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expiresAt: Date;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @AllowNull(true)
  @Column(DataType.STRING(45))
  declare ipAddress: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare userAgent: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare lastUsedAt: Date;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare userId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  // Instance methods
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
