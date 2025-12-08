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
const FileController = __importStar(require("../controllers/file.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const upload_1 = require("../config/upload");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
const entityParamSchema = zod_1.z.object({
    entity_type: zod_1.z.string(),
    entity_id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
const categoryParamSchema = zod_1.z.object({
    category: zod_1.z.enum([
        "RESIDENT_IMAGE",
        "PROFILE_AVATAR",
        "SHIFT_REPORT",
        "SALARY_STATEMENT",
        "CARE_NOTE_ATTACHMENT",
    ]),
});
// ファイルアップロード
router.post("/upload", (0, rbac_middleware_1.requirePermission)("files:write"), upload_1.upload.single("file"), upload_1.handleUploadError, FileController.uploadFile);
// ファイル取得（ダウンロード）
router.get("/:id", (0, rbac_middleware_1.requirePermission)("files:read"), (0, validation_middleware_1.validate)(idParamSchema, "params"), FileController.getFile);
// エンティティ別ファイル一覧
router.get("/entity/:entity_type/:entity_id", (0, rbac_middleware_1.requirePermission)("files:read"), (0, validation_middleware_1.validate)(entityParamSchema, "params"), FileController.getFilesByEntity);
// カテゴリ別ファイル一覧
router.get("/category/:category", (0, rbac_middleware_1.requirePermission)("files:read"), (0, validation_middleware_1.validate)(categoryParamSchema, "params"), FileController.getFilesByCategory);
// ファイル削除
router.delete("/:id", (0, rbac_middleware_1.requirePermission)("files:write"), (0, validation_middleware_1.validate)(idParamSchema, "params"), FileController.deleteFileById);
exports.default = router;
