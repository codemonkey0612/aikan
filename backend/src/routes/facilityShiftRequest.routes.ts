import { Router } from "express";
import {
  getAllFacilityShiftRequests,
  getFacilityShiftRequestById,
  getFacilityShiftRequestByFacilityAndMonth,
  createFacilityShiftRequest,
  updateFacilityShiftRequest,
  deleteFacilityShiftRequest,
} from "../controllers/facilityShiftRequest.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("shifts:read"),
  getAllFacilityShiftRequests
);

router.get(
  "/:id",
  authenticate,
  requirePermission("shifts:read"),
  getFacilityShiftRequestById
);

router.get(
  "/facility/:facility_id/month/:year_month",
  authenticate,
  requirePermission("shifts:read"),
  getFacilityShiftRequestByFacilityAndMonth
);

router.post(
  "/",
  authenticate,
  requirePermission("shifts:write"),
  createFacilityShiftRequest
);

router.put(
  "/:id",
  authenticate,
  requirePermission("shifts:write"),
  updateFacilityShiftRequest
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("shifts:write"),
  deleteFacilityShiftRequest
);

export default router;

