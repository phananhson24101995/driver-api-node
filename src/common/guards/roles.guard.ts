// RolesGuard - Guard kiểm tra quyền truy cập dựa trên roles của user
// [MULTI-ROLE] Hỗ trợ user có nhiều vai trò
// Hoạt động cùng với @Roles() decorator để phân quyền API
// Nếu endpoint không gắn @Roles() -> cho phép truy cập (backward compatible)
// Nếu endpoint có @Roles() nhưng user không đủ quyền -> throw ForbiddenException
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// [MULTI-ROLE] Interface với roles mảng thay vì role đơn
interface JwtUserPayload {
  id: string;
  username: string;
  roles: string[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách roles được phép từ metadata (decorator @Roles())
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu endpoint không gắn @Roles() hoặc metadata không phải mảng -> cho phép truy cập tất cả
    if (
      !requiredRoles ||
      !Array.isArray(requiredRoles) ||
      requiredRoles.length === 0
    ) {
      return true;
    }

    // Lấy thông tin user từ request (đã được JwtStrategy inject)
    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtUserPayload }>();
    const user = request.user;

    // Nếu không có user (chưa xác thực) -> từ chối
    if (!user || !user.roles || user.roles.length === 0) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    // [MULTI-ROLE] Normalize tất cả roles của user cho backward compatibility
    const normalizedUserRoles = user.roles.map((r) => {
      let normalized = (r || '').toLowerCase();
      if (normalized === 'administrator') normalized = 'admin';
      if (normalized === 'user') normalized = 'teacher';
      return normalized;
    });

    // [MULTI-ROLE] Kiểm tra: user có BẤT KỲ role nào khớp required roles không
    const hasRole = requiredRoles.some((required) =>
      normalizedUserRoles.includes(required),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Vai trò '${user.roles.join(', ')}' không có quyền thực hiện hành động này. Yêu cầu: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
