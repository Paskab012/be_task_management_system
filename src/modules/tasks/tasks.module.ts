import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task, Board, User } from '@/database/models';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([Task, Board, User])],
  controllers: [TasksController],
  providers: [TasksService, ResponseHelper],
  exports: [TasksService],
})
export class TasksModule {}
