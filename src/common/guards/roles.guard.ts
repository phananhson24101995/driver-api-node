// RolesGuard - Guard kiểm tra quyền truy cập dựa trên role của user
// Hoạt động cùng với @Roles() decorator để phân quyền API
// Nếu endpoint không gắn @Roles() -> cho phép truy cập (backward compatible)
// Nếu endpoint có @Roles() nhưng user không đủ quyền -> throw ForbiddenException
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

// Interface định nghĩa kiểu dữ liệu user được inject vào request bởi JwtStrategy.validate()
interface JwtUserPayload {
  id: string;
  username: string;
  role: string;
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
    // Ép kiểu user về JwtUserPayload để tránh lỗi "Unsafe member access on any"
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload | undefined;

    // Nếu không có user (chưa xác thực) -> từ chối
    if (!user || !user.role) {
      throw new ForbiddenException(
        "Bạn không có quyền truy cập tài nguyên này",
      );
    }

    // Kiểm tra role của user có nằm trong danh sách roles được phép không
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Vai trò '${user.role}' không có quyền thực hiện hành động này. Yêu cầu: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
