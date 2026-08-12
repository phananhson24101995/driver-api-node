import { AuditLogService } from './audit-log.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

@Controller('api/AuditLog')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('admin', 'admin-teacher') // Chỉ Admin mới xem được lịch sử log
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tableName') tableName?: string,
    @Query('action') action?: string,
  ) {
    const query = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      tableName,
      action,
    };
    return await this.auditLogService.getLogs(query);
  }
}
