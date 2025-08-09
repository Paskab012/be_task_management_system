import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BoardsModule } from './modules/boards/boards.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { FilesModule } from './modules/files/files.module';
import { appConfig, databaseConfig, jwtConfig } from './config';
import { ResponseHelper } from './common/helpers/response.helper';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BoardsModule,
    TasksModule,
    OrganizationsModule,
    NotificationsModule,
    AuditLogsModule,
    FilesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ResponseHelper],
})
export class AppModule {}
