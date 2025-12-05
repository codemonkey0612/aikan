import { Router } from "express";
import {
  calculateNurseSalary,
  calculateAndSaveSalary,
  getAllSalaries,
} from "../controllers/salaryCalculation.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("salaries:read"),
  getAllSalaries
);

router.get(
  "/calculate/:nurse_id/:year_month",
  authenticate,
  requirePermission("salaries:read"),
  calculateNurseSalary
);

router.post(
  "/calculate",
  authenticate,
  requirePermission("salaries:write"),
  calculateAndSaveSalary
);

export default router;

