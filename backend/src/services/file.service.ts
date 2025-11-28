import * as FileModel from "../models/file.model";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export const getAllFiles = FileModel.getAllFiles;
export const getFileById = FileModel.getFileById;
export const getFilesByEntity = FileModel.getFilesByEntity;
export const getFilesByCategory = FileModel.getFilesByCategory;
export const createFile = FileModel.createFile;
export const updateFile = FileModel.updateFile;

export const deleteFile = async (id: number) => {
  const file = await FileModel.getFileById(id);
  if (file) {
    // ファイルシステムからファイルを削除
    try {
      const filePath = join(process.cwd(), "uploads", file.file_path);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error: any) {
      // ファイルが存在しない場合は無視（ENOENTエラー）
      if (error.code !== "ENOENT") {
        console.error("Error deleting file from filesystem:", error);
      }
    }
  }
  // データベースからレコードを削除
  await FileModel.deleteFile(id);
};

