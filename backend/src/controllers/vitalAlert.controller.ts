import { Request, Response } from "express";
import * as VitalAlertService from "../services/vitalAlert.service";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const createVitalAlertSchema = z.object({
  resident_id: z
    .string()
    .trim()
    .min(1, "入居者IDは必須です"),
  alert_type: z.enum(["SYSTOLIC_BP", "DIASTOLIC_BP", "PULSE", "TEMPERATURE", "SPO2"], {
    message: "有効なアラートタイプを選択してください",
  }),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  active: z.boolean().optional(),
});

const updateVitalAlertSchema = createVitalAlertSchema.partial();

const acknowledgeAlertSchema = z.object({
  notes: z.string().optional().or(z.literal("")),
});

export const getAllVitalAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await VitalAlertService.getAllVitalAlerts();
    res.json(alerts);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "バイタルアラートの取得に失敗しました",
    });
  }
};

export const getVitalAlertById = async (req: Request, res: Response) => {
  try {
    const alert = await VitalAlertService.getVitalAlertById(
      Number(req.params.id)
    );
    if (!alert) {
      return res.status(404).json({ message: "バイタルアラートが見つかりません" });
    }
    res.json(alert);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "バイタルアラートの取得に失敗しました",
    });
  }
};

export const getVitalAlertsByResident = async (
  req: Request,
  res: Response
) => {
  try {
    const alerts = await VitalAlertService.getVitalAlertsByResident(
      req.params.resident_id
    );
    res.json(alerts);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "バイタルアラートの取得に失敗しました",
    });
  }
};

export const createVitalAlert = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    const data = createVitalAlertSchema.parse(req.body);
    const alert = await VitalAlertService.createVitalAlert({
      ...data,
      created_by: userId,
    });
    res.status(201).json(alert);
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
      message: error.message || "バイタルアラートの作成に失敗しました",
    });
  }
};

export const updateVitalAlert = async (req: Request, res: Response) => {
  try {
    const data = updateVitalAlertSchema.parse(req.body);
    const alert = await VitalAlertService.updateVitalAlert(
      Number(req.params.id),
      data
    );
    res.json(alert);
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
      message: error.message || "バイタルアラートの更新に失敗しました",
    });
  }
};

export const deleteVitalAlert = async (req: Request, res: Response) => {
  try {
    await VitalAlertService.deleteVitalAlert(Number(req.params.id));
    res.json({ message: "削除しました" });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "バイタルアラートの削除に失敗しました",
    });
  }
};

export const getVitalAlertTriggers = async (req: Request, res: Response) => {
  try {
    const resident_id = req.query.resident_id
      ? String(req.query.resident_id)
      : undefined;
    const acknowledged =
      req.query.acknowledged === "true"
        ? true
        : req.query.acknowledged === "false"
        ? false
        : undefined;
    const triggers = await VitalAlertService.getVitalAlertTriggers(
      resident_id,
      acknowledged
    );
    res.json(triggers);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "アラートトリガーの取得に失敗しました",
    });
  }
};

export const acknowledgeVitalAlertTrigger = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    if (!userId) {
      return res.status(401).json({ message: "認証が必要です" });
    }
    const { notes } = acknowledgeAlertSchema.parse(req.body);
    const trigger = await VitalAlertService.acknowledgeVitalAlertTrigger(
      Number(req.params.id),
      userId,
      notes
    );
    res.json(trigger);
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
      message: error.message || "アラートの確認に失敗しました",
    });
  }
};

