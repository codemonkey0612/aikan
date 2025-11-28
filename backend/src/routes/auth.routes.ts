import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../validations/auth.validation";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../validations/profile.validation";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh", validate(refreshTokenSchema), AuthController.refresh);
router.post("/logout", validate(logoutSchema), AuthController.logout);
router.get("/me", authenticate, AuthController.me);
router.put("/profile", authenticate, validate(updateProfileSchema), AuthController.updateProfile);
router.post("/change-password", authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;

