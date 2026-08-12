// === Role Service - Xử lý logic nghiệp vụ cho module Quản lý Role ===
// Hỗ trợ CRUD + seed roles mặc định + getMyPermissions (lấy quyền của user hiện tại)
import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../domain/entities/role.entity';
import { RoleCreateDto, RoleUpdateDto } from '../../application/dtos/role.dto';

// [DYNAMIC PERMISSIONS] Danh sách roles mặc định với permissions cụ thể cho mỗi role
const DEFAULT_ROLES = [
  {
    name: 'admin',
    label: 'Quản trị viên',
    description: 'Toàn quyền quản trị hệ thống',
    is_system: true,
    layout: 'admin',
    base_path: '/admin',
    // Admin có tất cả quyền
    permissions: [
      // Đã sửa lại định dạng để mỗi phần tử nằm trên một dòng riêng, khắc phục lỗi linter/prettier về độ dài dòng
      'dashboard',
      'accounts',
      'courses',
      'dats',
      'students',
      'teachers',
      'refreshtokens',
      'dathistories',
      'permissions',
      'roles',
    ],
  },
  {
    name: 'admin-teacher',
    label: 'Giáo viên Quản trị',
    description: 'Quản lý CRUD cơ bản',
    is_system: true,
    layout: 'admin',
    base_path: '/admin-teacher',
    // Admin-teacher có quyền quản lý cơ bản
    permissions: [
      // Đã sửa lại định dạng để mỗi phần tử nằm trên một dòng riêng, khắc phục lỗi linter/prettier về độ dài dòng
      'dashboard',
      'accounts',
      'courses',
      'dats',
      'students',
      'teachers',
    ],
  },
  {
    name: 'teacher',
    label: 'Giáo viên',
    description: 'Giáo viên sử dụng hệ thống',
    is_system: true,
    layout: 'main',
    base_path: '/',
    // Teacher dùng MainLayout, permissions trống (không có sidebar admin)
    permissions: [],
  },
];

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  // Seed roles mặc định khi module được khởi tạo
  // Nếu role đã tồn tại nhưng chưa có permissions → cập nhật thêm
  async onModuleInit() {
    for (const defaultRole of DEFAULT_ROLES) {
      const existing = await this.roleModel.findOne({ name: defaultRole.name });
      if (!existing) {
        // Tạo role mặc định nếu chưa tồn tại
        const role = new this.roleModel(defaultRole);
        await role.save();
      } else if (!existing.permissions || existing.permissions.length === 0) {
        // Nếu role đã tồn tại nhưng chưa có permissions → cập nhật
        existing.permissions = defaultRole.permissions;
        existing.layout = defaultRole.layout;
        existing.base_path = defaultRole.base_path;
        await existing.save();
      }
    }
  }

  // Lấy danh sách Role có phân trang và tìm kiếm
  async getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    keyword?: string,
  ) {
    const filter: Record<string, any> = {};
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      // Tìm kiếm theo name, label hoặc description
      filter.$or = [
        { name: { $regex: lowerKeyword, $options: 'i' } },
        { label: { $regex: lowerKeyword, $options: 'i' } },
        { description: { $regex: lowerKeyword, $options: 'i' } },
      ];
    }

    const totalCount = await this.roleModel.countDocuments(filter);
    const items = await this.roleModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      Items: items.map((item) => item.toObject() as Role),
      TotalCount: totalCount,
    };
  }

  // Lấy tất cả roles (không phân trang, dùng cho dropdown)
  async getAllNoPagination() {
    const items = await this.roleModel.find().exec();
    return items.map((item) => item.toObject() as Role);
  }

  // Lấy Role theo ID
  async getById(id: number) {
    const item = await this.roleModel.findOne({ id }).exec();
    return item ? item.toObject() : null;
  }

  // [MULTI-ROLE] Lấy permissions gộp từ NHIỀU roles
  // Gộp (union) permissions từ tất cả roles, loại trùng
  // Layout = 'admin' nếu bất kỳ role nào có layout admin
  async getPermissionsByRoleNames(roleNames: string[]) {
    // Normalize tất cả role names cho backward compatibility
    const normalizedNames = (roleNames || [])
      .map((name) => {
        let n = (name || '').toLowerCase();
        if (n === 'administrator') n = 'admin';
        if (n === 'user') n = 'teacher';
        return n;
      })
      .filter((n) => n.length > 0);

    if (normalizedNames.length === 0) {
      return {
        permissions: [],
        layout: 'main',
        base_path: '/',
        labels: [],
        names: [],
      };
    }

    // [FIX] Sử dụng RegExp để tìm kiếm case-insensitive chính xác (VD: tránh trường hợp nhập Admin nhưng query là admin)
    const regexNames = normalizedNames.map((n) => new RegExp(`^${n}$`, 'i'));

    // Fetch tất cả roles cùng lúc
    // Định dạng code: xuống dòng sau roleModel và find để dễ đọc
    const roles = await this.roleModel
      .find({ name: { $in: regexNames } })
      .exec();

    if (roles.length === 0) {
      return {
        permissions: [],
        layout: 'main',
        base_path: '/',
        labels: [],
        names: [],
      };
    }

    // Gộp permissions từ tất cả roles (union, loại trùng)
    const allPermissions = new Set<string>();
    let hasAdminLayout = false;

    for (const role of roles) {
      // Đã loại bỏ ngoặc đơn dư thừa quanh (role.permissions || [])
      for (const perm of role.permissions || []) {
        allPermissions.add(perm);
      }
      if ((role.layout || 'admin') === 'admin') {
        hasAdminLayout = true;
      }
    }

    return {
      permissions: Array.from(allPermissions),
      layout: hasAdminLayout ? 'admin' : 'main',
      base_path: hasAdminLayout ? '/admin' : '/',
      labels: roles.map((r) => r.label),
      names: roles.map((r) => r.name),
    };
  }

  // Tạo mới Role
  async create(dto: RoleCreateDto) {
    // [FIX] Chuẩn hóa name thành lowercase để tránh lỗi trùng lặp phân biệt hoa/thường
    if (dto.name) {
      dto.name = dto.name.toLowerCase().trim();
    }

    // Kiểm tra trùng tên role (case-insensitive)
    const existing = await this.roleModel.findOne({
      name: {
        $regex: new RegExp(`^${dto.name}$`, 'i'),
      },
    });
    if (existing) {
      throw new BadRequestException(`Role '${dto.name}' đã tồn tại`);
    }

    const item = new this.roleModel(dto);
    await item.save();
    return item.toObject();
  }

  // Cập nhật Role
  async update(id: number, dto: RoleUpdateDto) {
    // [FIX] Chuẩn hóa name
    if (dto.name) {
      dto.name = dto.name.toLowerCase().trim();
      // Kiểm tra trùng tên (case-insensitive) nhưng khác id hiện tại
      const existing = await this.roleModel.findOne({
        name: { $regex: new RegExp(`^${dto.name}$`, 'i') },
        id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException(`Role '${dto.name}' đã tồn tại`);
      }
    }

    const item = await this.roleModel.findOneAndUpdate({ id }, dto, {
      new: true,
    });
    return item ? item.toObject() : null;
  }

  // Xóa Role (không cho phép xóa role hệ thống)
  async delete(id: number) {
    const role = await this.roleModel.findOne({ id });
    if (!role) return false;

    // Không cho phép xóa role hệ thống
    if (role.is_system) {
      throw new BadRequestException(
        `Không thể xóa role hệ thống '${role.name}'. Các role mặc định (admin, admin-teacher, teacher) được bảo vệ.`,
      );
    }

    const result = await this.roleModel.findOneAndDelete({ id });
    return result !== null;
  }
}
