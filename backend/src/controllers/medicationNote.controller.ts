import { Request, Response } from "express";
import * as MedicationNoteService from "../services/medicationNote.service";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const createMedicationNoteSchema = z.object({
  resident_id: z
    .string()
    .trim()
    .min(1, "入居者IDは必須です"),
  medication_name: z.string().min(1, "薬剤名は必須です").max(255),
  dosage: z.string().max(100).optional().or(z.literal("")),
  frequency: z.string().max(100).optional().or(z.literal("")),
  route: z.string().max(50).optional().or(z.literal("")),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(z.literal("")),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(z.literal("")),
  prescribed_by: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "DISCONTINUED", "COMPLETED"]).optional(),
});

const updateMedicationNoteSchema = createMedicationNoteSchema.partial();

export const getAllMedicationNotes = async (req: Request, res: Response) => {
  try {
    const notes = await MedicationNoteService.getAllMedicationNotes();
    res.json(notes);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "薬剤メモの取得に失敗しました",
    });
  }
};

export const getMedicationNoteById = async (req: Request, res: Response) => {
  try {
    const note = await MedicationNoteService.getMedicationNoteById(
      Number(req.params.id)
    );
    if (!note) {
      return res.status(404).json({ message: "薬剤メモが見つかりません" });
    }
    res.json(note);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "薬剤メモの取得に失敗しました",
    });
  }
};

export const getMedicationNotesByResident = async (
  req: Request,
  res: Response
) => {
  try {
    const notes = await MedicationNoteService.getMedicationNotesByResident(
      req.params.resident_id
    );
    res.json(notes);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "薬剤メモの取得に失敗しました",
    });
  }
};

export const getActiveMedicationNotesByResident = async (
  req: Request,
  res: Response
) => {
  try {
    const notes =
      await MedicationNoteService.getActiveMedicationNotesByResident(
        req.params.resident_id
      );
    res.json(notes);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "薬剤メモの取得に失敗しました",
    });
  }
};

export const createMedicationNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    const data = createMedicationNoteSchema.parse(req.body);
    const note = await MedicationNoteService.createMedicationNote({
      ...data,
      created_by: userId,
    });
    res.status(201).json(note);
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
      message: error.message || "薬剤メモの作成に失敗しました",
    });
  }
};

export const updateMedicationNote = async (req: Request, res: Response) => {
  try {
    const data = updateMedicationNoteSchema.parse(req.body);
    const note = await MedicationNoteService.updateMedicationNote(
      Number(req.params.id),
      data
    );
    res.json(note);
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
      message: error.message || "薬剤メモの更新に失敗しました",
    });
  }
};

export const deleteMedicationNote = async (req: Request, res: Response) => {
  try {
    await MedicationNoteService.deleteMedicationNote(Number(req.params.id));
    res.json({ message: "削除しました" });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "薬剤メモの削除に失敗しました",
    });
  }
};

