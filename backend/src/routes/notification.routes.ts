import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission, requireAdminOrFacilityManager } from "../middlewares/rbac.middleware";

const router = Router();

// すべてのルートで認証必須
router.use(authenticate);

// 通知一覧・詳細: 全ロール閲覧可能
router.get("/", requirePermission("notifications:read"), NotificationController.getAllNotifications);
router.get("/:id", requirePermission("notifications:read"), NotificationController.getNotificationById);

// 通知作成: 誰でも作成可能（認証済みユーザー）
router.post("/", NotificationController.createNotification);

// 通知更新・削除: 所有者のみ更新可能、管理者は削除可能
router.put("/:id", NotificationController.updateNotification);
router.delete("/:id", NotificationController.deleteNotification);

export default router;

