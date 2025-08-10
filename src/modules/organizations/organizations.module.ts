import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Organization, User } from '@/database/models';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([Organization, User])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, ResponseHelper],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
