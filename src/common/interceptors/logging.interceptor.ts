import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditLogService } from '../../api/audit-log/audit-log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Thêm định dạng type Request & { user?: ... } để sửa lỗi "Unsafe assignment of an any value"
    const request = context
      .switchToHttp()
      .getRequest<
        Request & { user?: { username?: string; id?: string | number } }
      >();
    const method = request.method;

    // Chỉ log các thao tác có thể thay đổi dữ liệu
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(() => {
          const user = request.user;
          const url = request.url;
          // Ép kiểu request.body về unknown để sửa lỗi "Unsafe assignment of an any value"
          const body = request.body as unknown;
          const ipAddress = request.ip || request.connection.remoteAddress;
          const userAgent = request.headers['user-agent'];

          // Suy đoán tên bảng từ URL (Ví dụ: /api/students -> students)
          const tableName = url.split('/')[2] || 'unknown';

          // Xử lý promise trả về bằng .catch để bắt và log lỗi nếu việc ghi audit log thất bại, thay vì bỏ qua bằng void
          this.auditLogService
            .logAction({
              tableName,
              action: method,
              newValues: method !== 'DELETE' ? body : undefined,
              // Sử dụng .toString() để đảm bảo user.id luôn là string (hoặc undefined) nhằm tránh lỗi type mismatch
              executedByUserId: user
                ? user.username || user.id?.toString()
                : 'anonymous',
              ipAddress,
              userAgent,
            })
            .catch((err) => {
              console.error('Audit log failed:', err);
            });
        }),
      );
    }

    return next.handle();
  }
}
