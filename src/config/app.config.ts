import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  baseApiPort: process.env.BASE_API_PORT || '3000',

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',

  appName: process.env.APP_NAME || 'Task Management System',

  enableDocumentation: process.env.ENABLE_DOCUMENTATION === 'true',
  enableOrmLogs: process.env.ENABLE_ORM_LOGS === 'true',

  senderEmail: process.env.SENDER_EMAIL || 'noreply@taskmanagement.com',
  frontendLink: process.env.FRONTEND_LINK || 'http://localhost:3001',

  mailjetApiKey: process.env.MAILJET_APIKEY || '',
  mailjetApiSecret: process.env.MAILJET_API_SECRET || '',

  verifyExpirationTime: process.env.VERIFY_EXPIRATION_TIME || '2h',

  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
  ],

  throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),

  cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10),

  googleAuthClientId: process.env.GOOGLEAUTH_CLIENT_ID || '',
  googleAuthClientSecret: process.env.GOOGLEAUTH_CLIENT_SECRET || '',
  googleAuthRedirectUri:
    process.env.GOOGLEAUTH_REDIRECT_URI ||
    'http://localhost:3000/auth/google/callback',
}));
