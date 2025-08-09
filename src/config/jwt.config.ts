import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  accessTokenExpiration: process.env.JWT_EXPIRATION_TIME || '1h',
  refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  algorithm: 'HS256',
}));
