import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // CORS configuration
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL'),
      'http://localhost:3001',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: configService.get('NODE_ENV') === 'production',
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation setup
  if (configService.get<boolean>('ENABLE_DOCUMENTATION')) {
    setupSwagger(app, globalPrefix);
  }

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`🌐 Global API Prefix: /${globalPrefix}`);

  if (configService.get<boolean>('ENABLE_DOCUMENTATION')) {
    logger.log(
      `📚 Swagger documentation: http://localhost:${port}/${globalPrefix}/docs`,
    );
  }

  logger.log(`🔧 Environment: ${configService.get('NODE_ENV')}`);
  logger.log(`💾 Database: ${configService.get('DATABASE_NAME')}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});
