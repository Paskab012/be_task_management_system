import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ROLE_PERMISSIONS } from '@/constants/role.permissions';
import { Permission } from '@/common/enums';
import { AuthenticatedUser } from '@/modules/auth/interfaces';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
  route?: {
    path: string;
  };
  method: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly responseHelper: ResponseHelper,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: AuthenticatedUser | undefined = request.user;

    const skipPermissions = this.reflector.get<boolean>(
      'skipPermissions',
      context.getHandler(),
    );

    if (skipPermissions) {
      console.log('⏭️ Skipping permission check');
      return true;
    }

    if (!user) {
      throw new ForbiddenException(
        this.responseHelper.error({
          message: 'User not authenticated',
          errors: null,
        }),
      );
    }

    const path: string = request.route?.path || '';
    const method: string = request.method;

    console.log('🔍 Checking permissions for:', {
      path,
      method,
      userRole: user.role,
    });

    const feature: string | null = this.getFeatureFromPath(path);

    if (!feature) {
      console.log('❌ No feature found for path:', path);
      return true;
    }

    const requiredAction: string = this.getRequiredAction(method);
    const requiredPermission: string = `${requiredAction}:${feature}`;

    console.log('🔑 Required permission:', requiredPermission);

    const userRole = user.role;
    const userPermissions: Permission[] = ROLE_PERMISSIONS.get(userRole) || [];

    console.log('👤 User permissions:', userPermissions);

    const hasPermission: boolean = userPermissions.some(
      (permission: Permission) => permission.toString() === requiredPermission,
    );

    console.log('✅ Has permission:', hasPermission);

    if (!hasPermission) {
      throw new ForbiddenException(
        this.responseHelper.error({
          message: 'User does not have the required permissions.',
          errors: null,
        }),
      );
    }

    return true;
  }

  private getRequiredAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'create';
      case 'GET':
        return 'read';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'read';
    }
  }

  private getFeatureFromPath(path: string): string | null {
    const cleanPath: string = path.replace(/^\/api/, '');
    const pathSegments: string[] = cleanPath
      .split('/')
      .filter((segment: string) => segment);

    console.log('🛤️ Path segments:', pathSegments);

    const featureMapping: Record<string, string> = {
      users: 'user',
      boards: 'board',
      tasks: 'task',
      organizations: 'organization',
      notifications: 'notification',
      'audit-logs': 'audit_logs',
      files: 'attachment',
    };

    for (const segment of pathSegments) {
      const mappedFeature: string | undefined = featureMapping[segment];
      if (mappedFeature) {
        return mappedFeature;
      }
    }

    return null;
  }
}
