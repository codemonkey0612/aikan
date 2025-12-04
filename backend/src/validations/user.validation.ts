import { z } from "zod";
import type { UserRole } from "../types/roles";

const userRoleSchema = z.enum(["admin", "nurse", "facility_manager", "corporate_officer"]);

/**
 * ユーザー作成のバリデーションスキーマ
 */
export const createUserSchema = z.object({
  first_name: z.string().min(1, "名は必須です").max(100).optional().nullable(),
  last_name: z.string().min(1, "姓は必須です").max(100).optional().nullable(),
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください")
    .max(255),
  phone_number: z.string().regex(/^[0-9-]+$/).max(30).optional().nullable(),
  role: userRoleSchema.optional(),
  password: z
    .string()
    .min(6, "パスワードは6文字以上である必要があります")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "パスワードは大文字、小文字、数字を含む必要があります"),
});

/**
 * ユーザー更新のバリデーションスキーマ
 */
export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100).optional().nullable(),
  last_name: z.string().min(1).max(100).optional().nullable(),
  email: z.string().email().max(255).optional(),
  phone_number: z.string().regex(/^[0-9-]+$/).max(30).optional().nullable(),
  role: userRoleSchema.optional(),
  password: z
    .string()
    .min(6)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

