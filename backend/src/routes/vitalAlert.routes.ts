import { Router } from "express";
import * as VitalAlertController from "../controllers/vitalAlert.controller";
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

router.get("/", requirePermission("vitals:read"), VitalAlertController.getAllVitalAlerts);
router.get("/resident/:resident_id", requirePermission("vitals:read"), validate(residentIdParamSchema, "params"), VitalAlertController.getVitalAlertsByResident);
router.get("/triggers", requirePermission("vitals:read"), VitalAlertController.getVitalAlertTriggers);
router.get("/:id", requirePermission("vitals:read"), validate(idParamSchema, "params"), VitalAlertController.getVitalAlertById);
router.post("/", requirePermission("vitals:write"), VitalAlertController.createVitalAlert);
router.put("/:id", requirePermission("vitals:write"), validate(idParamSchema, "params"), VitalAlertController.updateVitalAlert);
router.delete("/:id", requirePermission("vitals:write"), validate(idParamSchema, "params"), VitalAlertController.deleteVitalAlert);
router.post("/triggers/:id/acknowledge", requirePermission("vitals:write"), validate(idParamSchema, "params"), VitalAlertController.acknowledgeVitalAlertTrigger);

export default router;

