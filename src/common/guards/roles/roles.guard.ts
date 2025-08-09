/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@/common/enums';
import { ROLE_PERMISSIONS } from '@/constants/role.permissions';
import { ROLES_KEY } from '../../decorators/roles.decorators';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorators';
import { AuthenticatedUser } from '@/modules/auth/interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    // Check permissions
    if (requiredPermissions) {
      const userPermissions = ROLE_PERMISSIONS.get(user.role) || [];
      const hasRequiredPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission as any),
      );

      if (!hasRequiredPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}
