import { z } from "zod";

export const createFacilitySchema = z.object({
  corporation_id: z.number().int().positive("法人IDは正の整数である必要があります"),
  name: z.string().min(1, "施設名は必須です").max(255, "施設名は255文字以内で入力してください"),
  code: z.string().max(50).optional().nullable(),
  postal_code: z.string().regex(/^\d{3}-?\d{4}$/, "郵便番号の形式が正しくありません").optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
});

export const updateFacilitySchema = createFacilitySchema.partial();

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;

