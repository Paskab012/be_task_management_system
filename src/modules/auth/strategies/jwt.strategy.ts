import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces';
import { User } from '@/database/models';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secretKey = configService.get<string>('jwt.secret');

    if (!secretKey) {
      throw new Error('JWT secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    try {
      const user = await User.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const userData = {
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        sessionId: payload.sessionId,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      };

      return userData;
    } catch (error) {
      console.log('error :>> ', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
