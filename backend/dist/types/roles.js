"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
/**
 * ロールの権限定義
 */
exports.ROLE_PERMISSIONS = {
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
        "shifts:write",
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
function hasPermission(role, permission) {
    return exports.ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
/**
 * ロールが複数の権限のいずれかを持っているかチェック
 */
function hasAnyPermission(role, permissions) {
    return permissions.some((permission) => hasPermission(role, permission));
}
/**
 * ロールがすべての権限を持っているかチェック
 */
function hasAllPermissions(role, permissions) {
    return permissions.every((permission) => hasPermission(role, permission));
}
