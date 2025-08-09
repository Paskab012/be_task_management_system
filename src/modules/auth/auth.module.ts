import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies';
import { User, UserSession } from '@/database/models';
import jwtConfig from '@/config/jwt.config';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpiration'),
          algorithm: 'HS256',
        },
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([User, UserSession]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ResponseHelper],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
