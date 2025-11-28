import { z } from "zod";

const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);

export const createResidentSchema = z.object({
  facility_id: z.number().int().positive("施設IDは正の整数である必要があります"),
  first_name: z.string().min(1, "名は必須です").max(100).optional().nullable(),
  last_name: z.string().min(1, "姓は必須です").max(100).optional().nullable(),
  gender: genderSchema.optional().nullable(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "生年月日はYYYY-MM-DD形式で入力してください").optional().nullable(),
  status: z.string().max(100).optional().nullable(),
});

export const updateResidentSchema = createResidentSchema.partial();

export type CreateResidentInput = z.infer<typeof createResidentSchema>;
export type UpdateResidentInput = z.infer<typeof updateResidentSchema>;

