import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { AuthenticatedUser } from '@/modules/auth/interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly responseHelper: ResponseHelper,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) {
      throw new ForbiddenException(
        this.responseHelper.error({
          message: 'User not authenticated',
          errors: null,
        }),
      );
    }

    if (!user.role) {
      throw new ForbiddenException(
        this.responseHelper.error({
          message: 'User role not found',
          errors: null,
        }),
      );
    }

    const hasRole: boolean = roles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        this.responseHelper.error({
          message: 'User does not have the required role permissions.',
          errors: null,
        }),
      );
    }

    return true;
  }
}
