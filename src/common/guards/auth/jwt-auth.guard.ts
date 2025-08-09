import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ResponseHelper } from '../../helpers/response.helper';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

interface CustomRequest {
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly responseHelper: ResponseHelper,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      console.log('🔓 PUBLIC ENDPOINT - Skipping JWT validation');
      return true;
    }

    const request = context.switchToHttp().getRequest<CustomRequest>();

    if (!request.headers.authorization) {
      console.log('❌ No authorization header');
      throw new UnauthorizedException(
        this.responseHelper.error({
          message: 'Unauthorized Access: No token provided',
          errors: null,
        }),
      );
    }

    console.log('🔐 PROTECTED ENDPOINT - Checking JWT');
    console.log(
      '🎫 Token preview:',
      request.headers.authorization.substring(0, 30) + '...',
    );

    try {
      const result = super.canActivate(context);
      console.log('✅ super.canActivate() called successfully');

      // If it's a Promise, add logging
      if (result instanceof Promise) {
        return result.then(
          (success) => {
            console.log('✅ JWT validation promise resolved:', success);
            return success;
          },
          (error) => {
            console.log('❌ JWT validation promise rejected:', error);
            throw error;
          },
        );
      }

      return result;
    } catch (error) {
      console.log('💥 Error in super.canActivate():', error);
      throw error;
    }
  }

  handleRequest<TUser = any>(
    err: Error | null,
    user: TUser | false,
    info?: any,
    context?: ExecutionContext,
    status?: any,
  ): TUser {
    console.log('🔍 HANDLE REQUEST CALLED');
    console.log('  - Error:', err);
    console.log('  - User:', user ? 'User object received' : 'No user');
    console.log('  - Info:', info);
    console.log('  - Status:', status);

    if (err) {
      console.log('❌ Error in handleRequest:', err);
      throw new UnauthorizedException(
        this.responseHelper.error({
          message: 'Unauthorized Access: Invalid token',
          errors: null,
        }),
      );
    }

    if (!user) {
      console.log('❌ No user in handleRequest');
      throw new UnauthorizedException(
        this.responseHelper.error({
          message: 'Unauthorized Access: Invalid token',
          errors: null,
        }),
      );
    }

    console.log('✅ HandleRequest successful, returning user');
    return user;
  }
}
