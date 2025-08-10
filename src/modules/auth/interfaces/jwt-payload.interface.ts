import { RoleType } from '@/common/enums';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: RoleType;
  organizationId?: string;
  sessionId?: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
