import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TaskComment, Task } from '@/database/models';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([TaskComment, Task])],
  controllers: [CommentsController],
  providers: [CommentsService, ResponseHelper],
  exports: [CommentsService],
})
export class CommentsModule {}
