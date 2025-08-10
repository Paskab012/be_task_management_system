/* eslint-disable @typescript-eslint/no-misused-promises */
import { Module } from '@nestjs/common';
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
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
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
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
