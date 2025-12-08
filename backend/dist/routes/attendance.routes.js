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
const AttendanceController = __importStar(require("../controllers/attendance.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// すべてのルートで認証必須
router.use(auth_middleware_1.authenticate);
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
const shiftIdParamSchema = zod_1.z.object({
    shift_id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
// 出退勤記録の取得
router.get("/my", (0, rbac_middleware_1.requirePermission)("shifts:read"), AttendanceController.getMyAttendance);
router.get("/shift/:shift_id", (0, rbac_middleware_1.requirePermission)("shifts:read"), (0, validation_middleware_1.validate)(shiftIdParamSchema, "params"), AttendanceController.getAttendanceByShift);
router.get("/:id", (0, rbac_middleware_1.requirePermission)("shifts:read"), (0, validation_middleware_1.validate)(idParamSchema, "params"), AttendanceController.getAttendanceById);
// チェックイン/アウト（NURSE、FACILITY_MANAGER、ADMINのみ）
router.post("/check-in", (0, rbac_middleware_1.requirePermission)("shifts:write"), AttendanceController.checkIn);
router.post("/check-out", (0, rbac_middleware_1.requirePermission)("shifts:write"), AttendanceController.checkOut);
// ステータス更新（ADMIN、FACILITY_MANAGERのみ）
router.put("/status", (0, rbac_middleware_1.requirePermission)("shifts:write"), AttendanceController.updateStatus);
// PIN生成（NURSE、FACILITY_MANAGER、ADMINのみ）
router.post("/generate-pin", (0, rbac_middleware_1.requirePermission)("shifts:write"), AttendanceController.generatePin);
exports.default = router;
