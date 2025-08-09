import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@/common/enums';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing a route
 * @param roles - Array of required roles
 * @example
 * @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
 * @Get('admin-only')
 * adminOnlyRoute() { ... }
 */
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
