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

    console.log('🔧 JWT Strategy constructor called');
    console.log('🔑 JWT Secret configured:', secretKey ? 'Yes' : 'No');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    console.log('🔍 JWT STRATEGY VALIDATE METHOD CALLED');
    console.log('📋 Received payload:', {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    });

    try {
      console.log('🔎 Looking for user with ID:', payload.sub);

      const user = await User.findOne({
        where: { id: payload.sub },
      });

      console.log(
        '👤 Database query result:',
        user ? 'User found' : 'User not found',
      );

      if (!user) {
        console.log('❌ User not found in database');
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        console.log('❌ User account is inactive');
        throw new UnauthorizedException('User account is inactive');
      }

      console.log('✅ User validation successful:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });

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

      console.log('🎯 Returning user data to guard');
      return userData;
    } catch (error) {
      console.log('💥 JWT Strategy validation error:', error);
      console.log('📚 Error stack:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
