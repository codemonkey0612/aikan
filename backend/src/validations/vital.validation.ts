import { z } from "zod";

export const createVitalSchema = z.object({
  resident_id: z.string().min(1, "入居者IDは必須です").max(50), // VARCHAR(50)
  measured_at: z.string().datetime("測定日時は有効な日時形式である必要があります"),
  systolic_bp: z.number().int().min(0).max(300, "収縮期血圧は0-300の範囲で入力してください").optional().nullable(),
  diastolic_bp: z.number().int().min(0).max(300, "拡張期血圧は0-300の範囲で入力してください").optional().nullable(),
  pulse: z.number().int().min(0).max(300, "脈拍は0-300の範囲で入力してください").optional().nullable(),
  temperature: z.number().min(30).max(45, "体温は30-45度の範囲で入力してください").optional().nullable(),
  spo2: z.number().int().min(0).max(100, "SpO2は0-100の範囲で入力してください").optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
});

export const updateVitalSchema = createVitalSchema.partial();

export type CreateVitalInput = z.infer<typeof createVitalSchema>;
export type UpdateVitalInput = z.infer<typeof updateVitalSchema>;

