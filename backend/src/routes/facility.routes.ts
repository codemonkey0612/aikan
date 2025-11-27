import { Router } from "express";
import * as FacilityController from "../controllers/facility.controller";

const router = Router();

router.get("/", FacilityController.getAllFacilities);
router.get("/:id", FacilityController.getFacilityById);
router.post("/", FacilityController.createFacility);
router.put("/:id", FacilityController.updateFacility);
router.delete("/:id", FacilityController.deleteFacility);

export default router;

