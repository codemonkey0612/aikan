"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController = __importStar(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_validation_1 = require("../validations/auth.validation");
const profile_validation_1 = require("../validations/profile.validation");
const router = (0, express_1.Router)();
router.post("/register", (0, validation_middleware_1.validate)(auth_validation_1.registerSchema), AuthController.register);
router.post("/login", (0, validation_middleware_1.validate)(auth_validation_1.loginSchema), AuthController.login);
router.post("/refresh", (0, validation_middleware_1.validate)(auth_validation_1.refreshTokenSchema), AuthController.refresh);
router.post("/logout", (0, validation_middleware_1.validate)(auth_validation_1.logoutSchema), AuthController.logout);
router.get("/me", auth_middleware_1.authenticate, AuthController.me);
router.put("/profile", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(profile_validation_1.updateProfileSchema), AuthController.updateProfile);
router.post("/change-password", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(profile_validation_1.changePasswordSchema), AuthController.changePassword);
exports.default = router;
