// === Role Controller - API endpoints cho quản lý vai trò ===
// Cung cấp CRUD + endpoint lấy tất cả roles (cho dropdown)
// + endpoint my-permissions (lấy quyền của user hiện tại)
// Chỉ admin mới được quản lý roles
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleCreateDto, RoleUpdateDto } from '../../application/dtos/role.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
// [SECURITY] Import RBAC - Phân quyền API theo vai trò
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

// [MULTI-ROLE] Interface cho request có user từ JwtStrategy
interface RequestWithUser {
  user?: {
    id: number;
    username: string;
    roles: string[];
  };
}

@ApiTags('Role')
@ApiBearerAuth()
@Controller('api/Role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // [MULTI-ROLE] Lấy permissions gộp từ TẤT CẢ roles của user hiện tại
  // Bất kỳ user nào cũng truy cập được — dùng để render sidebar + header
  // ĐẶT TRƯỚC các route có :id param để tránh conflict
  @Get('my-permissions')
  @UseGuards(AuthGuard('jwt'))
  @ResponseMessage('Lấy quyền của vai trò hiện tại thành công')
  async getMyPermissions(@Req() req: RequestWithUser) {
    const roleNames = req.user?.roles || [];
    return this.roleService.getPermissionsByRoleNames(roleNames);
  }

  // GET tất cả roles không phân trang (cho dropdown chọn role)
  // Cho phép admin và admin-teacher truy cập
  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'admin-teacher')
  @ResponseMessage('Lấy tất cả vai trò thành công')
  async getAllNoPagination() {
    return this.roleService.getAllNoPagination();
  }

  // GET danh sách Role có phân trang (chỉ admin)
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ResponseMessage('Lấy danh sách vai trò thành công')
  async getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.roleService.getAll(pageNumber, pageSize, keyword);
    const totalPages = Math.ceil(result.TotalCount / pageSize);

    return {
      items: result.Items,
      totalCount: result.TotalCount,
      pageNumber,
      pageSize,
      totalPages,
    };
  }

  // GET chi tiết Role theo ID (chỉ admin)
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ResponseMessage('Lấy vai trò thành công')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const item = await this.roleService.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy vai trò');
    }
    return item;
  }

  // POST tạo mới Role (chỉ admin)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tạo vai trò thành công')
  async create(@Body() dto: RoleCreateDto) {
    return this.roleService.create(dto);
  }

  // PUT cập nhật Role (chỉ admin)
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cập nhật vai trò thành công')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RoleUpdateDto,
  ) {
    const result = await this.roleService.update(id, dto);
    if (!result) {
      throw new NotFoundException('Không tìm thấy vai trò');
    }
    return result;
  }

  // DELETE xóa Role (chỉ admin, không xóa được role hệ thống)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa vai trò thành công')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.roleService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy vai trò');
    }
    return null;
  }
}
