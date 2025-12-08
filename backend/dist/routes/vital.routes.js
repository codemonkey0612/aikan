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
const VitalController = __importStar(require("../controllers/vital.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const vital_validation_1 = require("../validations/vital.validation");
const pagination_validation_1 = require("../validations/pagination.validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// すべてのルートで認証必須
router.use(auth_middleware_1.authenticate);
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
// バイタル一覧・詳細: 全ロール閲覧可能（ページネーション対応）
router.get("/", (0, rbac_middleware_1.requirePermission)("vitals:read"), (0, validation_middleware_1.validateQuery)(pagination_validation_1.paginationQuerySchema), VitalController.getAllVitals);
router.get("/:id", (0, rbac_middleware_1.requirePermission)("vitals:read"), (0, validation_middleware_1.validate)(idParamSchema, "params"), VitalController.getVitalById);
// バイタル作成・更新: NURSE、FACILITY_MANAGER、ADMINのみ
router.post("/", (0, rbac_middleware_1.requirePermission)("vitals:write"), (0, validation_middleware_1.validate)(vital_validation_1.createVitalSchema), VitalController.createVital);
router.put("/:id", (0, rbac_middleware_1.requirePermission)("vitals:write"), (0, validation_middleware_1.validate)(vital_validation_1.updateVitalSchema), VitalController.updateVital);
// バイタル削除: ADMINまたはFACILITY_MANAGERのみ
router.delete("/:id", rbac_middleware_1.requireAdminOrFacilityManager, (0, validation_middleware_1.validate)(idParamSchema, "params"), VitalController.deleteVital);
exports.default = router;
