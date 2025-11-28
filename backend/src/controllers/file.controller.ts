import { Request, Response } from "express";
import * as FileService from "../services/file.service";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { rename } from "fs/promises";
import type { FileCategory } from "../models/file.model";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ファイルがアップロードされていません" });
    }

    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    const {
      category,
      entity_type,
      entity_id,
    }: {
      category: FileCategory;
      entity_type: string;
      entity_id: string;
    } = req.body;

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
    const categoryDirs: Record<string, string> = {
      RESIDENT_IMAGE: "residents",
      PROFILE_AVATAR: "avatars",
      SHIFT_REPORT: "shifts",
      SALARY_STATEMENT: "salaries",
      CARE_NOTE_ATTACHMENT: "care-notes",
    };

    const subDir = categoryDirs[category] || "care-notes";
    const correctDir = join(process.cwd(), "uploads", subDir);
    const currentFilePath = req.file.path; // Multerが保存した現在のパス
    const correctFilePath = join(correctDir, req.file.filename);

    // ファイルが正しいディレクトリにない場合、移動する
    if (currentFilePath !== correctFilePath) {
      try {
        // 正しいディレクトリが存在しない場合は作成
        if (!existsSync(correctDir)) {
          mkdirSync(correctDir, { recursive: true });
        }
        
        // ファイルを正しいディレクトリに移動
        await rename(currentFilePath, correctFilePath);
        console.log(`File moved from ${currentFilePath} to ${correctFilePath}`);
      } catch (error: any) {
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
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ファイルのアップロードに失敗しました",
    });
  }
};

export const getFile = async (req: Request, res: Response) => {
  try {
    const file = await FileService.getFileById(Number(req.params.id));
    if (!file) {
      return res.status(404).json({ message: "ファイルが見つかりません" });
    }

    const filePath = join(process.cwd(), "uploads", file.file_path);

    if (!existsSync(filePath)) {
      return res.status(404).json({ message: "ファイルが見つかりません" });
    }

    res.sendFile(filePath, {
      headers: {
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.original_name)}"`,
      },
    });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ファイルの取得に失敗しました",
    });
  }
};

export const getFilesByEntity = async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id } = req.params;
    const files = await FileService.getFilesByEntity(
      entity_type,
      Number(entity_id)
    );
    res.json(files);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ファイルの取得に失敗しました",
    });
  }
};

export const getFilesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const files = await FileService.getFilesByCategory(
      category as FileCategory
    );
    res.json(files);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ファイルの取得に失敗しました",
    });
  }
};

export const deleteFileById = async (req: Request, res: Response) => {
  try {
    await FileService.deleteFile(Number(req.params.id));
    res.json({ message: "ファイルを削除しました" });
  } catch (error: any) {
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

