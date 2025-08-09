import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLog } from '@/database/models';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, ResponseHelper],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
