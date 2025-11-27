import { Router } from "express";
import * as VitalController from "../controllers/vital.controller";

const router = Router();

router.get("/", VitalController.getAllVitals);
router.get("/:id", VitalController.getVitalById);
router.post("/", VitalController.createVital);
router.put("/:id", VitalController.updateVital);
router.delete("/:id", VitalController.deleteVital);

export default router;

