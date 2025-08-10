import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from '@/database/models';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([Board])],
  controllers: [BoardsController],
  providers: [BoardsService, ResponseHelper],
  exports: [BoardsService],
})
export class BoardsModule {}
