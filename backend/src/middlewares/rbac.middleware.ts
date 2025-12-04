import { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/roles";
import { hasAnyPermission } from "../types/roles";

/**
 * ロールベースアクセス制御ミドルウェア
 * 指定されたロールのみアクセスを許可
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

/**
 * 権限ベースアクセス制御ミドルウェア
 * 指定された権限のいずれかを持っている場合のみアクセスを許可
 */
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as UserRole | undefined;

    if (!userRole) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    if (!hasAnyPermission(userRole, permissions)) {
      return res.status(403).json({
        message: "この操作を実行する権限がありません",
        requiredPermissions: permissions,
        userRole,
      });
    }

    next();
  };
};

/**
 * adminのみアクセス可能
 */
export const requireAdmin = requireRole("admin");

/**
 * adminまたはfacility_managerのみアクセス可能
 */
export const requireAdminOrFacilityManager = requireRole("admin", "facility_manager");

