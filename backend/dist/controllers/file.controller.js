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
exports.deleteFileById = exports.getFilesByCategory = exports.getFilesByEntity = exports.getFile = exports.uploadFile = void 0;
const FileService = __importStar(require("../services/file.service"));
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "ファイルがアップロードされていません" });
        }
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        const { category, entity_type, entity_id, } = req.body;
        console.log("Upload request:", {
            category,
            entity_type,
            entity_id,
            fileMimeType: req.file.mimetype,
            fileName: req.file.originalname,
        });
        if (!category || !entity_type || !entity_id) {
            return res.status(400).json({
                message: "category, entity_type, entity_id は必須です",
            });
        }
        // カテゴリ別のファイルパスを構築
        const categoryDirs = {
            RESIDENT_IMAGE: "residents",
            PROFILE_AVATAR: "avatars",
            SHIFT_REPORT: "shifts",
            SALARY_STATEMENT: "salaries",
            CARE_NOTE_ATTACHMENT: "care-notes",
        };
        const subDir = categoryDirs[category] || "care-notes";
        const correctDir = (0, path_1.join)(process.cwd(), "uploads", subDir);
        const currentFilePath = req.file.path; // Multerが保存した現在のパス
        const correctFilePath = (0, path_1.join)(correctDir, req.file.filename);
        // ファイルが正しいディレクトリにない場合、移動する
        if (currentFilePath !== correctFilePath) {
            try {
                // 正しいディレクトリが存在しない場合は作成
                if (!(0, fs_1.existsSync)(correctDir)) {
                    (0, fs_1.mkdirSync)(correctDir, { recursive: true });
                }
                // ファイルを正しいディレクトリに移動
                await (0, promises_1.rename)(currentFilePath, correctFilePath);
                console.log(`File moved from ${currentFilePath} to ${correctFilePath}`);
            }
            catch (error) {
                console.error("Error moving file to correct directory:", error);
                // ファイル移動に失敗しても続行（既に保存されているため）
            }
        }
        const filePath = `${subDir}/${req.file.filename}`;
        const file = await FileService.createFile({
            file_name: req.file.filename,
            original_name: req.file.originalname,
            file_path: filePath,
            file_type: req.file.mimetype.split("/")[0], // 'image' or 'application'
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            category,
            entity_type,
            entity_id: Number(entity_id),
            uploaded_by: userId,
        });
        res.status(201).json(file);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ファイルのアップロードに失敗しました",
        });
    }
};
exports.uploadFile = uploadFile;
const getFile = async (req, res) => {
    try {
        const file = await FileService.getFileById(Number(req.params.id));
        if (!file) {
            return res.status(404).json({ message: "ファイルが見つかりません" });
        }
        const filePath = (0, path_1.join)(process.cwd(), "uploads", file.file_path);
        if (!(0, fs_1.existsSync)(filePath)) {
            return res.status(404).json({ message: "ファイルが見つかりません" });
        }
        res.sendFile(filePath, {
            headers: {
                "Content-Type": file.mime_type || "application/octet-stream",
                "Content-Disposition": `inline; filename="${encodeURIComponent(file.original_name)}"`,
            },
        });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ファイルの取得に失敗しました",
        });
    }
};
exports.getFile = getFile;
const getFilesByEntity = async (req, res) => {
    try {
        const { entity_type, entity_id } = req.params;
        const files = await FileService.getFilesByEntity(entity_type, Number(entity_id));
        res.json(files);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ファイルの取得に失敗しました",
        });
    }
};
exports.getFilesByEntity = getFilesByEntity;
const getFilesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const files = await FileService.getFilesByCategory(category);
        res.json(files);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ファイルの取得に失敗しました",
        });
    }
};
exports.getFilesByCategory = getFilesByCategory;
const deleteFileById = async (req, res) => {
    try {
        await FileService.deleteFile(Number(req.params.id));
        res.json({ message: "ファイルを削除しました" });
    }
    catch (error) {
        // ファイルが存在しない場合でも成功として扱う
        if (error.code === "ENOENT") {
            return res.json({ message: "ファイルを削除しました（ファイルは既に存在しませんでした）" });
        }
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ファイルの削除に失敗しました",
        });
    }
};
exports.deleteFileById = deleteFileById;
