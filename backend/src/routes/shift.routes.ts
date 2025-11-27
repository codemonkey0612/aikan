import { Router } from "express";
import * as ShiftController from "../controllers/shift.controller";

const router = Router();

router.get("/", ShiftController.getAllShifts);
router.get("/:id", ShiftController.getShiftById);
router.post("/", ShiftController.createShift);
router.put("/:id", ShiftController.updateShift);
router.delete("/:id", ShiftController.deleteShift);

export default router;

