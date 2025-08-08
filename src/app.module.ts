import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BoardsModule } from './modules/boards/boards.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    AuthModule,
    UsersModule,
    BoardsModule,
    TasksModule,
    OrganizationsModule,
    NotificationsModule,
    AuditLogsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
