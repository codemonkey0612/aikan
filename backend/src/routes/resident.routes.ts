import { Router } from "express";
import * as ResidentController from "../controllers/resident.controller";

const router = Router();

router.get("/", ResidentController.getAllResidents);
router.get("/:id", ResidentController.getResidentById);
router.post("/", ResidentController.createResident);
router.put("/:id", ResidentController.updateResident);
router.delete("/:id", ResidentController.deleteResident);

export default router;

