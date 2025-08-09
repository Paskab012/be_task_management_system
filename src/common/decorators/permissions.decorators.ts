import { SetMetadata } from '@nestjs/common';
import { Permission } from '@/common/enums';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for accessing a route
 * @param permissions - Array of required permissions
 * @example
 * @RequirePermissions(Permission.CREATE_USER, Permission.UPDATE_USER)
 * @Post('users')
 * createUser() { ... }
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
