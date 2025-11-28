import { Router } from "express";
import * as ShiftController from "../controllers/shift.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission, requireAdminOrFacilityManager } from "../middlewares/rbac.middleware";
import { validate, validateQuery } from "../middlewares/validation.middleware";
import { paginationQuerySchema } from "../validations/pagination.validation";
import { z } from "zod";

const router = Router();

// すべてのルートで認証必須
router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// シフト一覧・詳細: 全ロール閲覧可能（ページネーション対応）
router.get("/", requirePermission("shifts:read"), validateQuery(paginationQuerySchema), ShiftController.getAllShifts);
router.get("/:id", requirePermission("shifts:read"), validate(idParamSchema, "params"), ShiftController.getShiftById);

// シフト作成・更新: ADMINまたはFACILITY_MANAGERのみ
router.post("/", requirePermission("shifts:write"), ShiftController.createShift);
router.put("/:id", requirePermission("shifts:write"), ShiftController.updateShift);

// シフト削除: ADMINまたはFACILITY_MANAGERのみ
router.delete("/:id", requireAdminOrFacilityManager, ShiftController.deleteShift);

export default router;

