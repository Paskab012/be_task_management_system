import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  Logger,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log('🚨 GLOBAL EXCEPTION FILTER CAUGHT ERROR:');
    console.log('🛤️ Request URL:', request.url);
    console.log('🔧 Request method:', request.method);
    console.log('📦 Request body:', request.body);
    console.log('🎯 Exception type:', typeof exception);
    console.log('🏗️ Exception constructor:', exception?.constructor?.name);

    if (exception instanceof Error) {
      console.log('💬 Exception message:', exception.message);
      console.log('📍 Exception stack:', exception.stack);
    }

    console.log('🔍 Full exception object:', exception);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    console.log('📤 Sending error response:', { status, message });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // CORS configuration
  app.enableCors({
    origin:
      configService.get('NODE_ENV') === 'production'
        ? [configService.get<string>('FRONTEND_URL')]
        : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
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
