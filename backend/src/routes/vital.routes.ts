import { Router } from "express";
import * as VitalController from "../controllers/vital.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission, requireAdminOrFacilityManager } from "../middlewares/rbac.middleware";
import { validate, validateQuery } from "../middlewares/validation.middleware";
import { createVitalSchema, updateVitalSchema } from "../validations/vital.validation";
import { paginationQuerySchema } from "../validations/pagination.validation";
import { z } from "zod";

const router = Router();

// すべてのルートで認証必須
router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// バイタル一覧・詳細: 全ロール閲覧可能（ページネーション対応）
router.get("/", requirePermission("vitals:read"), validateQuery(paginationQuerySchema), VitalController.getAllVitals);
router.get("/:id", requirePermission("vitals:read"), validate(idParamSchema, "params"), VitalController.getVitalById);

// バイタル作成・更新: NURSE、FACILITY_MANAGER、ADMINのみ
router.post("/", requirePermission("vitals:write"), validate(createVitalSchema), VitalController.createVital);
router.put("/:id", requirePermission("vitals:write"), validate(updateVitalSchema), VitalController.updateVital);

// バイタル削除: ADMINまたはFACILITY_MANAGERのみ
router.delete("/:id", requireAdminOrFacilityManager, validate(idParamSchema, "params"), VitalController.deleteVital);

export default router;

