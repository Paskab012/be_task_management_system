/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { User } from '@/database/models';
import { UserSession } from '@/database/models/user-session.model';
import { RoleType } from '@/common/enums';
import {
  LoginDto,
  SignupDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from './dto';
import { JwtPayload, AuthenticatedUser, TokenPair } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //login : email and password
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    console.log('🔍 LOGIN ATTEMPT STARTED');
    console.log('📧 Email:', email);

    try {
      // Find user by email
      const user = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        console.log('❌ No user found with email:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log('👤 User found:', user.id);

      if (!user.isActive) {
        console.log('❌ User not active');
        throw new UnauthorizedException('Account has been deactivated');
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log('❌ Password validation failed');
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log('✅ Password valid, updating last login...');
      await user.update({ lastLoginAt: new Date() });

      // Generate tokens
      const tokenPair = await this.generateTokenPair(user);

      const response = this.buildAuthResponse(user, tokenPair);
      console.log('✅ LOGIN COMPLETED SUCCESSFULLY');

      return {
        status: 'success',
        message: 'Login successful',
        response,
      };
    } catch (error) {
      console.log('💥 LOGIN ERROR:', error.message);
      throw error;
    }
  }

  //signup : create new user
  // Note: This method should handle email verification and password hashing
  // It should also send a verification email to the user
  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      jobTitle,
      department,
    } = signupDto;

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await this.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = this.generateRandomToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      id: uuidv4(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: RoleType.USER,
      phone: phone || null,
      jobTitle: jobTitle || null,
      department: department || null,
      isEmailVerified: false,
      isActive: true,
      emailVerificationToken,
      emailVerificationExpires,
      organizationId: null,
      lastLoginAt: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    // TODO: Send verification email
    // await this.emailService.sendVerificationEmail(
    //   user.email,
    //   emailVerificationToken,
    // );

    // Generate tokens
    const tokenPair = await this.generateTokenPair(user);

    return this.buildAuthResponse(user, tokenPair);
  }

  //Refresh access token using refresh token
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken);
      const session = await UserSession.findOne({
        where: {
          refreshToken,
          isActive: true,
          userId: payload.sub,
        },
        include: [
          {
            model: User,
            // include: ['organization'],
          },
        ],
      });

      if (!session || session.isExpired) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = session.user;

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User account is not active');
      }
      await session.update({ lastUsedAt: new Date() });

      const newTokenPair = await this.generateTokenPair(user, session.id);
      await session.update({ refreshToken: newTokenPair.refreshToken });

      return this.buildAuthResponse(user, newTokenPair);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  //Logout user and invalidate session
  async logout(
    userId: string,
    sessionId?: string,
  ): Promise<{ message: string }> {
    const whereClause: {
      userId: string;
      isActive: boolean;
      id?: string;
    } = { userId, isActive: true };

    if (sessionId) {
      whereClause.id = sessionId;
    }

    await UserSession.update({ isActive: false }, { where: whereClause });

    return { message: 'Successfully logged out' };
  }

  //Logout from all devices
  async logoutAll(userId: string): Promise<{ message: string }> {
    await UserSession.update(
      { isActive: false },
      { where: { userId, isActive: true } },
    );

    return { message: 'Successfully logged out from all devices' };
  }
  //Forgot password: send reset link to email
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = this.generateRandomToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    // TODO: Send password reset email
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  //Reset password using reset token

  //Reset password using reset token
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);
    await user.update({
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    await UserSession.update(
      { isActive: false },
      { where: { userId: user.id } },
    );

    return { message: 'Password reset successfully' };
  }

  //Verify email using verification token
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await user.update({
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    return { message: 'Email verified successfully' };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || undefined,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    };
  }

  //Validate JWT payload and return authenticated user
  async validateJwtPayload(
    payload: JwtPayload,
  ): Promise<AuthenticatedUser | null> {
    const user = await User.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || undefined,
      sessionId: payload.sessionId,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    };
  }

  //Generate JWT token pair (access + refresh)
  private async generateTokenPair(
    user: User,
    existingSessionId?: string,
  ): Promise<TokenPair> {
    try {
      console.log('🎫 Token generation started for user:', user.id);

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId || undefined,
      };

      console.log('📋 JWT Payload:', payload);

      const accessTokenExpiresIn =
        this.configService.get<string>('jwt.accessTokenExpiration') || '15m';
      const refreshTokenExpiresIn =
        this.configService.get<string>('jwt.refreshTokenExpiration') || '7d';

      console.log('⏰ Token expiration times:', {
        access: accessTokenExpiresIn,
        refresh: refreshTokenExpiresIn,
      });

      // Generate access token
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: accessTokenExpiresIn,
      });

      // Generate refresh token
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: refreshTokenExpiresIn,
      });

      console.log('✅ JWT tokens generated successfully');

      const expiresIn = this.parseTimeToSeconds(accessTokenExpiresIn);

      const sessionData = {
        refreshToken,
        expiresAt: new Date(
          Date.now() + this.parseTimeToSeconds(refreshTokenExpiresIn) * 1000,
        ),
        isActive: true,
        lastUsedAt: new Date(),
      };

      console.log('💾 Creating user session...');

      if (existingSessionId) {
        await UserSession.update(sessionData, {
          where: { id: existingSessionId, userId: user.id },
        });
      } else {
        await UserSession.create({
          id: uuidv4(),
          userId: user.id,
          ...sessionData,
        } as any);
      }

      console.log('✅ User session created/updated successfully');

      return {
        accessToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      console.log('💥 Token generation error:', error.message);
      throw error;
    }
  }

  //Build authentication response
  private buildAuthResponse(user: User, tokenPair: TokenPair): AuthResponseDto {
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        fullName: `${user.firstName} ${user.lastName}`,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
      },
    };
  }

  //Hash password using bcrypt
  private async hashPassword(password: string): Promise<string> {
    const saltRounds =
      Number(this.configService.get<string>('SALT_ROUNDS')) || 12;
    return bcrypt.hash(password, saltRounds);
  }
  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      console.log('🔒 Password validation details:');
      console.log('  - Plain password length:', password.length);
      console.log('  - Hash length:', hashedPassword.length);
      console.log('  - Hash starts with $2:', hashedPassword.startsWith('$2'));
      console.log('  - Full hash prefix:', hashedPassword.substring(0, 7));

      const result = await bcrypt.compare(password, hashedPassword);
      console.log('  - Bcrypt comparison result:', result);

      return result;
    } catch (error) {
      console.log('💥 Password validation error:', error.message);
      return false;
    }
  }

  private generateRandomToken(): string {
    const uuid = uuidv4();
    return uuid.replace(/-/g, '') + Date.now().toString(36);
  }

  private parseTimeToSeconds(timeString: string): number {
    const timeUnit = timeString.slice(-1);
    const timeValue = parseInt(timeString.slice(0, -1), 10);

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        return 900; // Default 15 minutes
    }
  }
}
