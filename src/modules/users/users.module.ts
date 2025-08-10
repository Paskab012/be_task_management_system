import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '@/database/models';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService, ResponseHelper],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
