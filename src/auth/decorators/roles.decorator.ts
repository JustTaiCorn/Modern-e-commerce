import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Đánh dấu endpoint chỉ cho phép user có ít nhất một trong các role liệt kê.
 * Dùng cùng với `RolesGuard`.
 *
 * Ví dụ: `@Roles('admin')` hoặc `@Roles('admin', 'staff')`
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
