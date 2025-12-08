"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrFacilityManager = exports.requireAdmin = exports.requirePermission = exports.requireRole = void 0;
const roles_1 = require("../types/roles");
/**
 * ロールベースアクセス制御ミドルウェア
 * 指定されたロールのみアクセスを許可
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "この操作を実行する権限がありません",
                requiredRoles: allowedRoles,
                userRole,
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * 権限ベースアクセス制御ミドルウェア
 * 指定された権限のいずれかを持っている場合のみアクセスを許可
 */
const requirePermission = (...permissions) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        if (!(0, roles_1.hasAnyPermission)(userRole, permissions)) {
            return res.status(403).json({
                message: "この操作を実行する権限がありません",
                requiredPermissions: permissions,
                userRole,
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
/**
 * adminのみアクセス可能
 */
exports.requireAdmin = (0, exports.requireRole)("admin");
/**
 * adminまたはfacility_managerのみアクセス可能
 */
exports.requireAdminOrFacilityManager = (0, exports.requireRole)("admin", "facility_manager");
