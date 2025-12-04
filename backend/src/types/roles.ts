/**
 * ユーザーロール定義
 */
export type UserRole = "admin" | "nurse" | "facility_manager" | "corporate_officer";

/**
 * ロールの権限定義
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "users:read",
    "users:write",
    "facilities:read",
    "facilities:write",
    "corporations:read",
    "corporations:write",
    "residents:read",
    "residents:write",
    "vitals:read",
    "vitals:write",
    "shifts:read",
    "shifts:write",
    "visits:read",
    "visits:write",
    "salaries:read",
    "salaries:write",
    "notifications:read",
    "notifications:write",
    "files:read",
    "files:write",
    "alcohol_checks:read",
    "alcohol_checks:write",
  ],
  facility_manager: [
    "facilities:read",
    "facilities:write",
    "corporations:read",
    "residents:read",
    "residents:write",
    "vitals:read",
    "vitals:write",
    "shifts:read",
    "shifts:write",
    "visits:read",
    "visits:write",
    "notifications:read",
    "files:read",
    "files:write",
    "alcohol_checks:read",
    "alcohol_checks:write",
  ],
  nurse: [
    "corporations:read",
    "residents:read",
    "vitals:read",
    "vitals:write",
    "shifts:read",
    "visits:read",
    "visits:write",
    "notifications:read",
    "files:read",
    "files:write",
    "alcohol_checks:read",
    "alcohol_checks:write",
  ],
  corporate_officer: [
    "corporations:read",
    "corporations:write",
    "residents:read",
    "vitals:read",
    "shifts:read",
    "notifications:read",
    "files:read",
  ],
};

/**
 * ロールが特定の権限を持っているかチェック
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * ロールが複数の権限のいずれかを持っているかチェック
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * ロールがすべての権限を持っているかチェック
 */
export function hasAllPermissions(role: UserRole, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

