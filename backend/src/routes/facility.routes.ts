import { Router } from "express";
import * as FacilityController from "../controllers/facility.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission, requireAdminOrFacilityManager } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createFacilitySchema, updateFacilitySchema } from "../validations/facility.validation";
import { z } from "zod";

const router = Router();

// すべてのルートで認証必須
router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().min(1).max(50), // VARCHAR(50) - facility_id
});

// 施設一覧・詳細: 全ロール閲覧可能
router.get("/", requirePermission("facilities:read"), FacilityController.getAllFacilities);
router.get("/:id", requirePermission("facilities:read"), validate(idParamSchema, "params"), FacilityController.getFacilityById);

// 施設作成・更新・削除: ADMINまたはFACILITY_MANAGERのみ
router.post("/", requirePermission("facilities:write"), validate(createFacilitySchema), FacilityController.createFacility);
router.put("/:id", requirePermission("facilities:write"), validate(updateFacilitySchema), FacilityController.updateFacility);
router.delete("/:id", requireAdminOrFacilityManager, validate(idParamSchema, "params"), FacilityController.deleteFacility);

export default router;

