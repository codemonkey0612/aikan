import { Router } from "express";
import * as VisitController from "../controllers/visit.controller";
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

// 訪問一覧・詳細: 全ロール閲覧可能（ページネーション対応）
router.get("/", requirePermission("visits:read"), validateQuery(paginationQuerySchema), VisitController.getAllVisits);
router.get("/:id", requirePermission("visits:read"), validate(idParamSchema, "params"), VisitController.getVisitById);

// 訪問作成・更新: NURSE、FACILITY_MANAGER、ADMINのみ
router.post("/", requirePermission("visits:write"), VisitController.createVisit);
router.put("/:id", requirePermission("visits:write"), VisitController.updateVisit);

// 訪問削除: ADMINまたはFACILITY_MANAGERのみ
router.delete("/:id", requireAdminOrFacilityManager, VisitController.deleteVisit);

export default router;

