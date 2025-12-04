import { Router } from "express";
import * as CorporationController from "../controllers/corporation.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// すべてのルートで認証必須
router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().min(1).max(20), // VARCHAR(20) - corporation_id
});

// 法人一覧・詳細: 全ロール閲覧可能
router.get("/", requirePermission("corporations:read"), CorporationController.getAllCorporations);
router.get("/:id", requirePermission("corporations:read"), validate(idParamSchema, "params"), CorporationController.getCorporationById);

// 法人作成・更新・削除: ADMINまたはCORPORATE_OFFICERのみ
router.post("/", requirePermission("corporations:write"), CorporationController.createCorporation);
router.put("/:id", requirePermission("corporations:write"), validate(idParamSchema, "params"), CorporationController.updateCorporation);
router.delete("/:id", requirePermission("corporations:write"), validate(idParamSchema, "params"), CorporationController.deleteCorporation);

export default router;

