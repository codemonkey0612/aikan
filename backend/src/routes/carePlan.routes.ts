import { Router } from "express";
import * as CarePlanController from "../controllers/carePlan.controller";
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

const carePlanIdParamSchema = z.object({
  care_plan_id: z.string().regex(/^\d+$/).transform(Number),
});

router.get("/", requirePermission("residents:read"), CarePlanController.getAllCarePlans);
router.get("/resident/:resident_id", requirePermission("residents:read"), validate(residentIdParamSchema, "params"), CarePlanController.getCarePlansByResident);
router.get("/:id", requirePermission("residents:read"), validate(idParamSchema, "params"), CarePlanController.getCarePlanById);
router.post("/", requirePermission("residents:write"), CarePlanController.createCarePlan);
router.put("/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), CarePlanController.updateCarePlan);
router.delete("/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), CarePlanController.deleteCarePlan);

// Care Plan Items
router.get("/:care_plan_id/items", requirePermission("residents:read"), validate(carePlanIdParamSchema, "params"), CarePlanController.getCarePlanItems);
router.post("/items", requirePermission("residents:write"), CarePlanController.createCarePlanItem);
router.put("/items/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), CarePlanController.updateCarePlanItem);
router.delete("/items/:id", requirePermission("residents:write"), validate(idParamSchema, "params"), CarePlanController.deleteCarePlanItem);

export default router;

