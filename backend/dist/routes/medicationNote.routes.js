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
const MedicationNoteController = __importStar(require("../controllers/medicationNote.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
const residentIdParamSchema = zod_1.z.object({
    resident_id: zod_1.z.string().min(1).max(50), // VARCHAR(50)
});
router.get("/", (0, rbac_middleware_1.requirePermission)("residents:read"), MedicationNoteController.getAllMedicationNotes);
router.get("/resident/:resident_id", (0, rbac_middleware_1.requirePermission)("residents:read"), (0, validation_middleware_1.validate)(residentIdParamSchema, "params"), MedicationNoteController.getMedicationNotesByResident);
router.get("/resident/:resident_id/active", (0, rbac_middleware_1.requirePermission)("residents:read"), (0, validation_middleware_1.validate)(residentIdParamSchema, "params"), MedicationNoteController.getActiveMedicationNotesByResident);
router.get("/:id", (0, rbac_middleware_1.requirePermission)("residents:read"), (0, validation_middleware_1.validate)(idParamSchema, "params"), MedicationNoteController.getMedicationNoteById);
router.post("/", (0, rbac_middleware_1.requirePermission)("residents:write"), MedicationNoteController.createMedicationNote);
router.put("/:id", (0, rbac_middleware_1.requirePermission)("residents:write"), (0, validation_middleware_1.validate)(idParamSchema, "params"), MedicationNoteController.updateMedicationNote);
router.delete("/:id", (0, rbac_middleware_1.requirePermission)("residents:write"), (0, validation_middleware_1.validate)(idParamSchema, "params"), MedicationNoteController.deleteMedicationNote);
exports.default = router;
