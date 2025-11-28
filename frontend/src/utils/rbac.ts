import type { UserRole } from "../api/types";

/**
 * ロールの権限定義（フロントエンド用）
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    "users:read",
    "users:write",
    "facilities:read",
    "facilities:write",
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
    "alcohol_checks:read",
    "alcohol_checks:write",
  ],
  FACILITY_MANAGER: [
    "facilities:read",
    "facilities:write",
    "residents:read",
    "residents:write",
    "vitals:read",
    "vitals:write",
    "shifts:read",
    "shifts:write",
    "visits:read",
    "visits:write",
    "notifications:read",
    "alcohol_checks:read",
    "alcohol_checks:write",
  ],
  NURSE: [
    "residents:read",
    "vitals:read",
    "vitals:write",
    "shifts:read",
    "visits:read",
    "visits:write",
    "notifications:read",
    "alcohol_checks:read",
    "alcohol_checks:write",
  ],
  STAFF: [
    "residents:read",
    "vitals:read",
    "shifts:read",
    "notifications:read",
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

/**
 * ロールが指定されたロールのいずれかかチェック
 */
export function hasRole(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * ロールの日本語ラベルを取得
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMIN: "管理者",
    FACILITY_MANAGER: "施設管理者",
    NURSE: "看護師",
    STAFF: "スタッフ",
  };
  return labels[role] || role;
}

