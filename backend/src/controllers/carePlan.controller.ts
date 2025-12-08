import { Request, Response } from "express";
import * as CarePlanService from "../services/carePlan.service";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const createCarePlanSchema = z.object({
  resident_id: z
    .string()
    .trim()
    .min(1, "入居者IDは必須です"),
  title: z.string().min(1, "タイトルは必須です").max(255),
  description: z.string().optional().or(z.literal("")),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

const updateCarePlanSchema = createCarePlanSchema.partial();

const createCarePlanItemSchema = z.object({
  care_plan_id: z.number().int().positive("ケアプランIDは正の整数である必要があります"),
  task_description: z.string().min(1, "タスク説明は必須です"),
  frequency: z.string().max(100).optional().or(z.literal("")),
  assigned_to: z.number().int().positive().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(z.literal("")),
});

const updateCarePlanItemSchema = z.object({
  task_description: z.string().min(1).optional(),
  frequency: z.string().max(100).optional().or(z.literal("")),
  assigned_to: z.number().int().positive().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(z.literal("")),
  completed: z.boolean().optional(),
  completed_by: z.number().int().positive().optional(),
});

export const getAllCarePlans = async (req: Request, res: Response) => {
  try {
    const carePlans = await CarePlanService.getAllCarePlans();
    res.json(carePlans);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ケアプランの取得に失敗しました",
    });
  }
};

export const getCarePlanById = async (req: Request, res: Response) => {
  try {
    const carePlan = await CarePlanService.getCarePlanById(
      Number(req.params.id)
    );
    if (!carePlan) {
      return res.status(404).json({ message: "ケアプランが見つかりません" });
    }
    res.json(carePlan);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ケアプランの取得に失敗しました",
    });
  }
};

export const getCarePlansByResident = async (req: Request, res: Response) => {
  try {
    const carePlans = await CarePlanService.getCarePlansByResident(
      req.params.resident_id
    );
    res.json(carePlans);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ケアプランの取得に失敗しました",
    });
  }
};

export const createCarePlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    const data = createCarePlanSchema.parse(req.body);
    const carePlan = await CarePlanService.createCarePlan({
      ...data,
      created_by: userId,
    });
    res.status(201).json(carePlan);
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
      message: error.message || "ケアプランの作成に失敗しました",
    });
  }
};

export const updateCarePlan = async (req: Request, res: Response) => {
  try {
    const data = updateCarePlanSchema.parse(req.body);
    const carePlan = await CarePlanService.updateCarePlan(
      Number(req.params.id),
      data
    );
    res.json(carePlan);
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
      message: error.message || "ケアプランの更新に失敗しました",
    });
  }
};

export const deleteCarePlan = async (req: Request, res: Response) => {
  try {
    await CarePlanService.deleteCarePlan(Number(req.params.id));
    res.json({ message: "削除しました" });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ケアプランの削除に失敗しました",
    });
  }
};

// Care Plan Items
export const getCarePlanItems = async (req: Request, res: Response) => {
  try {
    const items = await CarePlanService.getCarePlanItems(
      Number(req.params.care_plan_id)
    );
    res.json(items);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ケアプラン項目の取得に失敗しました",
    });
  }
};

export const createCarePlanItem = async (req: Request, res: Response) => {
  try {
    const data = createCarePlanItemSchema.parse(req.body);
    const item = await CarePlanService.createCarePlanItem(data);
    res.status(201).json(item);
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
      message: error.message || "ケアプラン項目の作成に失敗しました",
    });
  }
};

export const updateCarePlanItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    const data = updateCarePlanItemSchema.parse(req.body);
    // completedがtrueの場合、completed_byを設定
    if (data.completed && !data.completed_by) {
      data.completed_by = userId;
    }
    const item = await CarePlanService.updateCarePlanItem(
      Number(req.params.id),
      data
    );
    res.json(item);
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
      message: error.message || "ケアプラン項目の更新に失敗しました",
    });
  }
};

export const deleteCarePlanItem = async (req: Request, res: Response) => {
  try {
    await CarePlanService.deleteCarePlanItem(Number(req.params.id));
    res.json({ message: "削除しました" });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ケアプラン項目の削除に失敗しました",
    });
  }
};

