/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import * as path from 'path';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  User,
  Organization,
  Board,
  Task,
  TaskComment,
  TaskAttachment,
  AuditLog,
  UserSession,
  Notification,
} from './models';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const useSSL = configService.get<string>('DATABASE_SSL') === 'true';

        return {
          dialect: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: parseInt(
            configService.get<string>('DATABASE_PORT') || '5432',
            10,
          ),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          models: [
            User,
            Organization,
            Board,
            Task,
            TaskComment,
            TaskAttachment,
            AuditLog,
            UserSession,
            Notification,
          ],
          synchronize: configService.get('NODE_ENV') === 'development',
          autoLoadModels: true,
          ssl: useSSL,
          dialectOptions: useSSL
            ? {
                ssl: {
                  require: true,
                  rejectUnauthorized: false,
                },
              }
            : {},
          migrationStoragePath: path.join(__dirname, '../migrations/meta.json'),
          logging:
            configService.get('NODE_ENV') === 'development'
              ? console.log
              : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
