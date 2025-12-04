import { Router } from "express";
import * as AlcoholCheckController from "../controllers/alcohol-check.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

const createAlcoholCheckSchema = z.object({
  body: z.object({
    user_id: z.number().int().positive(), // BIGINT UNSIGNED
    resident_id: z.string().max(50).nullable().optional(), // VARCHAR(50)
    breath_alcohol_concentration: z.number().min(0).max(1000),
    checked_at: z.string().datetime(),
    device_image_path: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

const updateAlcoholCheckSchema = z.object({
  body: z.object({
    resident_id: z.string().max(50).nullable().optional(), // VARCHAR(50)
    breath_alcohol_concentration: z.number().min(0).max(1000).optional(),
    checked_at: z.string().datetime().optional(),
    device_image_path: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

// 全アルコールチェック取得（管理者のみ）
router.get(
  "/",
  requirePermission("alcohol_checks:read"),
  AlcoholCheckController.getAllAlcoholChecks
);

// 自分のアルコールチェック取得
router.get(
  "/my",
  AlcoholCheckController.getMyAlcoholChecks
);

// アルコールチェック取得（ID指定）
router.get(
  "/:id",
  requirePermission("alcohol_checks:read"),
  validate(idParamSchema, "params"),
  AlcoholCheckController.getAlcoholCheckById
);

// アルコールチェック作成
router.post(
  "/",
  requirePermission("alcohol_checks:write"),
  validate(createAlcoholCheckSchema),
  AlcoholCheckController.createAlcoholCheck
);

// アルコールチェック更新
router.put(
  "/:id",
  requirePermission("alcohol_checks:write"),
  validate(idParamSchema, "params"),
  validate(updateAlcoholCheckSchema),
  AlcoholCheckController.updateAlcoholCheck
);

// アルコールチェック削除
router.delete(
  "/:id",
  requirePermission("alcohol_checks:write"),
  validate(idParamSchema, "params"),
  AlcoholCheckController.deleteAlcoholCheck
);

export default router;

