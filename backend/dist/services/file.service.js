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
exports.deleteFile = exports.updateFile = exports.createFile = exports.getFilesByCategory = exports.getFilesByEntity = exports.getFileById = exports.getAllFiles = void 0;
const FileModel = __importStar(require("../models/file.model"));
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
exports.getAllFiles = FileModel.getAllFiles;
exports.getFileById = FileModel.getFileById;
exports.getFilesByEntity = FileModel.getFilesByEntity;
exports.getFilesByCategory = FileModel.getFilesByCategory;
exports.createFile = FileModel.createFile;
exports.updateFile = FileModel.updateFile;
const deleteFile = async (id) => {
    const file = await FileModel.getFileById(id);
    if (file) {
        // ファイルシステムからファイルを削除
        try {
            const filePath = (0, path_1.join)(process.cwd(), "uploads", file.file_path);
            if ((0, fs_1.existsSync)(filePath)) {
                await (0, promises_1.unlink)(filePath);
            }
        }
        catch (error) {
            // ファイルが存在しない場合は無視（ENOENTエラー）
            if (error.code !== "ENOENT") {
                console.error("Error deleting file from filesystem:", error);
            }
        }
    }
    // データベースからレコードを削除
    await FileModel.deleteFile(id);
};
exports.deleteFile = deleteFile;
