import { RoleType } from '@/common/enums';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleType;
  organizationId?: string;
  sessionId?: string;
  isEmailVerified: boolean;
  isActive: boolean;
}

export interface UserCreationAttributes {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: RoleType;
  avatar?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  organizationId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
