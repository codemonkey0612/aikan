import { Router } from "express";
import * as MedicationNoteController from "../controllers/medicationNote.controller";
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

router.get("/", requirePermission("residents:read"), MedicationNoteController.getAllMedicationNotes);
router.get("/resident/:resident_id", requirePermission("residents:read"), validate(residentIdParamSchema, "params"), MedicationNoteController.getMedicationNotesByResident);
router.get("/resident/:resident_id/active", requirePermission("residents:read"), validate(residentIdParamSchema, "params"), MedicationNoteController.getActiveMedicationNotesByResident);
router.get("/:id", requirePermission("residents:read"), validate(idParamSchema, "params"), MedicationNoteController.getMedicationNoteById);
router.post("/", requirePermission("residents:write"), MedicationNoteController.createMedicationNote);
router.put("/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), MedicationNoteController.updateMedicationNote);
router.delete("/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), MedicationNoteController.deleteMedicationNote);

export default router;

