// Decorator @Roles() - Phân quyền API theo vai trò người dùng
// Sử dụng: @Roles('admin', 'teacher') để giới hạn quyền truy cập endpoint
import { SetMetadata } from '@nestjs/common';

// Key metadata dùng để lưu danh sách roles cho mỗi endpoint
export const ROLES_KEY = 'roles';

// Decorator @Roles() - Gắn vào controller/method để chỉ định roles được phép truy cập
// Ví dụ: @Roles('admin') -> chỉ admin mới được gọi API
// Ví dụ: @Roles('admin', 'teacher') -> cả admin và teacher đều được gọi
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
