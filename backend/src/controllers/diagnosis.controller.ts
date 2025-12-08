import { Request, Response } from "express";
import * as DiagnosisService from "../services/diagnosis.service";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const createDiagnosisSchema = z.object({
  resident_id: z
    .string()
    .trim()
    .min(1, "入居者IDは必須です"),
  diagnosis_code: z.string().max(50).optional().or(z.literal("")),
  diagnosis_name: z.string().min(1, "診断名は必須です").max(255),
  diagnosis_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(z.literal("")),
  severity: z.string().max(50).optional().or(z.literal("")),
  status: z.string().max(50).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  diagnosed_by: z.number().int().positive().optional(),
});

const updateDiagnosisSchema = createDiagnosisSchema.partial();

export const getAllDiagnoses = async (req: Request, res: Response) => {
  try {
    const diagnoses = await DiagnosisService.getAllDiagnoses();
    res.json(diagnoses);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "診断の取得に失敗しました",
    });
  }
};

export const getDiagnosisById = async (req: Request, res: Response) => {
  try {
    const diagnosis = await DiagnosisService.getDiagnosisById(
      Number(req.params.id)
    );
    if (!diagnosis) {
      return res.status(404).json({ message: "診断が見つかりません" });
    }
    res.json(diagnosis);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "診断の取得に失敗しました",
    });
  }
};

export const getDiagnosesByResident = async (req: Request, res: Response) => {
  try {
    const diagnoses = await DiagnosisService.getDiagnosesByResident(
      req.params.resident_id
    );
    res.json(diagnoses);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "診断の取得に失敗しました",
    });
  }
};

export const createDiagnosis = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    const data = createDiagnosisSchema.parse(req.body);
    const diagnosis = await DiagnosisService.createDiagnosis({
      ...data,
      diagnosed_by: data.diagnosed_by ?? userId,
    });
    res.status(201).json(diagnosis);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "バリデーションエラー",
        errors: error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "診断の作成に失敗しました",
    });
  }
};

export const updateDiagnosis = async (req: Request, res: Response) => {
  try {
    const data = updateDiagnosisSchema.parse(req.body);
    const diagnosis = await DiagnosisService.updateDiagnosis(
      Number(req.params.id),
      data
    );
    res.json(diagnosis);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "バリデーションエラー",
        errors: error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "診断の更新に失敗しました",
    });
  }
};

export const deleteDiagnosis = async (req: Request, res: Response) => {
  try {
    await DiagnosisService.deleteDiagnosis(Number(req.params.id));
    res.json({ message: "削除しました" });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "診断の削除に失敗しました",
    });
  }
};

