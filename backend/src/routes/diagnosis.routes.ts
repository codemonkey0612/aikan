import { Router } from "express";
import * as DiagnosisController from "../controllers/diagnosis.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

const residentIdParamSchema = z.object({
  resident_id: z.string().min(1).max(50), // VARCHAR(50)
});

router.get("/", requirePermission("residents:read"), DiagnosisController.getAllDiagnoses);
router.get("/resident/:resident_id", requirePermission("residents:read"), validate(residentIdParamSchema, "params"), DiagnosisController.getDiagnosesByResident);
router.get("/:id", requirePermission("residents:read"), validate(idParamSchema, "params"), DiagnosisController.getDiagnosisById);
router.post("/", requirePermission("residents:write"), DiagnosisController.createDiagnosis);
router.put("/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), DiagnosisController.updateDiagnosis);
router.delete("/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), DiagnosisController.deleteDiagnosis);

export default router;

