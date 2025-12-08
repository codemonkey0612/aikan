"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryDirs = exports.uploadDir = exports.handleUploadError = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = require("path");
const fs_1 = require("fs");
// アップロードディレクトリの設定
const uploadDir = (0, path_1.join)(process.cwd(), "uploads");
exports.uploadDir = uploadDir;
// ディレクトリが存在しない場合は作成
if (!(0, fs_1.existsSync)(uploadDir)) {
    (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
}
// カテゴリ別のサブディレクトリ
const categoryDirs = {
    RESIDENT_IMAGE: (0, path_1.join)(uploadDir, "residents"),
    PROFILE_AVATAR: (0, path_1.join)(uploadDir, "avatars"),
    SHIFT_REPORT: (0, path_1.join)(uploadDir, "shifts"),
    SALARY_STATEMENT: (0, path_1.join)(uploadDir, "salaries"),
    CARE_NOTE_ATTACHMENT: (0, path_1.join)(uploadDir, "care-notes"),
};
exports.categoryDirs = categoryDirs;
// サブディレクトリを作成
Object.values(categoryDirs).forEach((dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
});
// ストレージ設定
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // req.body.categoryを取得（multipart/form-dataから）
        // Multerはフィールドを解析する前にdestinationが呼ばれる可能性があるため、
        // req.bodyがまだ空の場合がある。その場合は後でコントローラーで処理する
        const category = req.body?.category;
        // デバッグログ
        console.log("Multer destination - category from req.body:", category);
        console.log("Multer destination - req.body:", req.body);
        console.log("Multer destination - file fieldname:", file.fieldname);
        // categoryが存在し、有効なカテゴリの場合のみ使用
        if (category && categoryDirs[category]) {
            const dir = categoryDirs[category];
            console.log(`Using directory for category ${category}: ${dir}`);
            cb(null, dir);
            return;
        }
        // categoryが存在しない、または無効な場合は一時的にデフォルトディレクトリを使用
        // コントローラーで正しいディレクトリに移動する
        console.warn(`Category ${category} not found or invalid, using default directory. Will be corrected in controller.`);
        const defaultDir = categoryDirs["CARE_NOTE_ATTACHMENT"] || uploadDir;
        cb(null, defaultDir);
    },
    filename: (req, file, cb) => {
        // 一意のファイル名を生成: timestamp-random-originalname
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = file.originalname.split(".").pop();
        const filename = `${uniqueSuffix}.${ext}`;
        cb(null, filename);
    },
});
// ファイルタイプの検証
const fileFilter = (req, file, cb) => {
    const category = req.body.category;
    // カテゴリ別の許可されるMIMEタイプ
    const allowedMimeTypes = {
        RESIDENT_IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
        PROFILE_AVATAR: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
        SHIFT_REPORT: ["application/pdf"],
        SALARY_STATEMENT: ["application/pdf"],
        CARE_NOTE_ATTACHMENT: [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
    };
    const allowed = allowedMimeTypes[category] || allowedMimeTypes.CARE_NOTE_ATTACHMENT;
    // MIMEタイプの正規化（小文字に変換）
    const normalizedMimeType = file.mimetype.toLowerCase();
    if (allowed.some(type => type.toLowerCase() === normalizedMimeType)) {
        cb(null, true);
    }
    else {
        console.error(`Invalid file type: ${file.mimetype} for category: ${category}`);
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowed.join(", ")}`));
    }
};
// ファイルサイズ制限: 10MB
const limits = {
    fileSize: 10 * 1024 * 1024, // 10MB
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits,
});
// エラーハンドリングミドルウェア
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "ファイルサイズが大きすぎます。最大10MBまでです。" });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};
exports.handleUploadError = handleUploadError;
