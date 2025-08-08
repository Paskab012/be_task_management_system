import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  //   SWAGGER_API_ROOT,
  SWAGGER_API_NAME,
  SWAGGER_API_DESCRIPTION,
  SWAGGER_API_CURRENT_VERSION,
  SWAGGER_API_AUTH_NAME,
  SWAGGER_API_AUTH_LOCATION,
} from '../constants/swagger';

export const setupSwagger = (app: INestApplication, globalPrefix: string) => {
  const options = new DocumentBuilder()
    .setTitle(SWAGGER_API_NAME)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_CURRENT_VERSION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: SWAGGER_API_AUTH_LOCATION,
      },
      SWAGGER_API_AUTH_NAME,
    )
    .addTag('Authentication', 'Login, signup, and token management')
    .addTag('Users', 'User management operations')
    .addTag('Organizations', 'Organization management')
    .addTag('Boards', 'Board management operations')
    .addTag('Tasks', 'Task management operations')
    .addTag('Comments', 'Task comments operations')
    .addTag('Attachments', 'File attachment operations')
    .addTag('Notifications', 'User notification management')
    .addTag('Audit Logs', 'System audit trails')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Task Management API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .topbar-wrapper img { content: url('/logo.png'); width: 120px; height: auto; }
      .swagger-ui .topbar { background-color: #1f2937; }
    `,
  });
};
