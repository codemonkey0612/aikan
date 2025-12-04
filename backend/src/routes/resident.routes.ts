import { Router } from "express";
import * as ResidentController from "../controllers/resident.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission, requireAdminOrFacilityManager } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createResidentSchema, updateResidentSchema } from "../validations/resident.validation";
import { z } from "zod";

const router = Router();

// すべてのルートで認証必須
router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().min(1).max(50), // VARCHAR(50) - resident_id
});

// 入居者一覧・詳細: 全ロール閲覧可能
router.get("/", requirePermission("residents:read"), ResidentController.getAllResidents);
router.get("/:id", requirePermission("residents:read"), validate(idParamSchema, "params"), ResidentController.getResidentById);

// 入居者作成・更新・削除: ADMINまたはFACILITY_MANAGERのみ
router.post("/", requirePermission("residents:write"), validate(createResidentSchema), ResidentController.createResident);
router.put("/:id", requirePermission("residents:write"), validate(updateResidentSchema), ResidentController.updateResident);
router.delete("/:id", requireAdminOrFacilityManager, validate(idParamSchema, "params"), ResidentController.deleteResident);

export default router;

