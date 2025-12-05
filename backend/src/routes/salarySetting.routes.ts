import { Router } from "express";
import {
  getAllSalarySettings,
  getSalarySettingByKey,
  createSalarySetting,
  updateSalarySetting,
  deleteSalarySetting,
} from "../controllers/salarySetting.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("salaries:read"),
  getAllSalarySettings
);

router.get(
  "/:key",
  authenticate,
  requirePermission("salaries:read"),
  getSalarySettingByKey
);

router.post(
  "/",
  authenticate,
  requirePermission("salaries:write"),
  createSalarySetting
);

router.put(
  "/:key",
  authenticate,
  requirePermission("salaries:write"),
  updateSalarySetting
);

router.delete(
  "/:key",
  authenticate,
  requirePermission("salaries:write"),
  deleteSalarySetting
);

export default router;

