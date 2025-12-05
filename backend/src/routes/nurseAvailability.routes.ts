import { Router } from "express";
import {
  getAllNurseAvailabilities,
  getNurseAvailabilityById,
  getNurseAvailabilityByNurseAndMonth,
  createNurseAvailability,
  updateNurseAvailability,
  deleteNurseAvailability,
} from "../controllers/nurseAvailability.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("shifts:read"),
  getAllNurseAvailabilities
);

router.get(
  "/:id",
  authenticate,
  requirePermission("shifts:read"),
  getNurseAvailabilityById
);

router.get(
  "/nurse/:nurse_id/month/:year_month",
  authenticate,
  requirePermission("shifts:read"),
  getNurseAvailabilityByNurseAndMonth
);

router.post(
  "/",
  authenticate,
  requirePermission("shifts:write"),
  createNurseAvailability
);

router.put(
  "/:id",
  authenticate,
  requirePermission("shifts:write"),
  updateNurseAvailability
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("shifts:write"),
  deleteNurseAvailability
);

export default router;

