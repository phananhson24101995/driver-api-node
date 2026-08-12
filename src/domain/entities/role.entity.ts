// === Entity Role - Lưu trữ danh mục các vai trò trong hệ thống ===
// Mỗi role có name (unique key), label (tên hiển thị), description (mô tả)
// permissions: mảng các menu key mà role được phép truy cập
// Cho phép quản trị viên thêm/sửa/xóa vai trò động (dynamic roles)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({
  timestamps: { createdAt: 'create_update', updatedAt: 'last_update' },
})
export class Role {
  @Prop({ unique: true })
  id: number;

  // Tên role (unique key, dùng để phân quyền), ví dụ: 'admin', 'teacher'
  @Prop({ required: true, unique: true })
  name: string;

  // Tên hiển thị trên giao diện, ví dụ: 'Quản trị viên', 'Giáo viên'
  @Prop({ required: true })
  label: string;

  // Mô tả chi tiết về vai trò
  @Prop({ default: '' })
  description: string;

  // Đánh dấu role hệ thống (không cho phép xóa), ví dụ: admin, teacher
  @Prop({ default: false })
  is_system: boolean;

  // [DYNAMIC PERMISSIONS] Mảng menu key mà role được phép truy cập
  // Ví dụ: ['dashboard', 'accounts', 'courses', 'students']
  @Prop({ type: [String], default: [] })
  permissions: string[];

  // [DYNAMIC PERMISSIONS] Loại layout sử dụng: 'main' (teacher) hoặc 'admin' (quản trị)
  @Prop({ default: 'admin' })
  layout: string;

  // [DYNAMIC PERMISSIONS] Prefix URL cho role, ví dụ: '/admin', '/admin-teacher', '/'
  @Prop({ default: '' })
  base_path: string;

  // Thông tin audit
  @Prop({ default: null })
  create_editor?: string;

  @Prop({ default: null })
  last_editor?: string;

  @Prop()
  create_update?: Date;

  @Prop()
  last_update?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

