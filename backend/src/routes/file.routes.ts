import { Router } from "express";
import * as FileController from "../controllers/file.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { upload, handleUploadError } from "../config/upload";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

router.use(authenticate);

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

const entityParamSchema = z.object({
  entity_type: z.string(),
  entity_id: z.string().regex(/^\d+$/).transform(Number),
});

const categoryParamSchema = z.object({
  category: z.enum([
    "RESIDENT_IMAGE",
    "PROFILE_AVATAR",
    "SHIFT_REPORT",
    "SALARY_STATEMENT",
    "CARE_NOTE_ATTACHMENT",
  ]),
});

// ファイルアップロード
router.post(
  "/upload",
  requirePermission("files:write"),
  upload.single("file"),
  handleUploadError,
  FileController.uploadFile
);

// ファイル取得（ダウンロード）
router.get(
  "/:id",
  requirePermission("files:read"),
  validate(idParamSchema, "params"),
  FileController.getFile
);

// エンティティ別ファイル一覧
router.get(
  "/entity/:entity_type/:entity_id",
  requirePermission("files:read"),
  validate(entityParamSchema, "params"),
  FileController.getFilesByEntity
);

// カテゴリ別ファイル一覧
router.get(
  "/category/:category",
  requirePermission("files:read"),
  validate(categoryParamSchema, "params"),
  FileController.getFilesByCategory
);

// ファイル削除
router.delete(
  "/:id",
  requirePermission("files:write"),
  validate(idParamSchema, "params"),
  FileController.deleteFileById
);

export default router;

