import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification, User } from '@/database/models';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([Notification, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService, ResponseHelper],
  exports: [NotificationsService],
})
export class NotificationsModule {}
