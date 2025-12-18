import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin, requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createUserSchema, updateUserSchema } from "../validations/user.validation";
import { z } from "zod";

const router = Router();

// すべてのルートで認証必須
router.use(authenticate);

// パスパラメータのバリデーション
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "IDは数値である必要があります").transform(Number),
});

// ユーザー一覧・詳細: users:read権限を持つロール（admin, nurse等）
router.get("/", requirePermission("users:read"), UserController.getAllUsers);
router.get("/:id", requirePermission("users:read"), validate(idParamSchema, "params"), UserController.getUserById);

// ユーザー作成・更新・削除: ADMINのみ
router.post("/", requireAdmin, validate(createUserSchema), UserController.createUser);
router.put("/:id", requireAdmin, validate(updateUserSchema), UserController.updateUser);
router.delete("/:id", requireAdmin, validate(idParamSchema, "params"), UserController.deleteUser);

export default router;
