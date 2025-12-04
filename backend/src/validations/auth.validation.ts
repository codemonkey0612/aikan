import { z } from "zod";
import type { UserRole } from "../types/roles";

/**
 * ユーザーロールのバリデーション
 */
const userRoleSchema = z.enum(["admin", "nurse", "facility_manager", "corporate_officer"]);

/**
 * 登録リクエストのバリデーションスキーマ
 */
export const registerSchema = z.object({
  first_name: z.string().min(1, "名は必須です").max(100, "名は100文字以内で入力してください").optional(),
  last_name: z.string().min(1, "姓は必須です").max(100, "姓は100文字以内で入力してください").optional(),
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以内で入力してください"),
  phone_number: z
    .string()
    .regex(/^[0-9-]+$/, "電話番号は数字とハイフンのみ使用できます")
    .max(30, "電話番号は30文字以内で入力してください")
    .optional()
    .nullable(),
  role: userRoleSchema.default("nurse"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上である必要があります")
    .max(100, "パスワードは100文字以内で入力してください")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "パスワードは大文字、小文字、数字を含む必要があります"
    ),
});

/**
 * ログインリクエストのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
});

/**
 * リフレッシュトークンリクエストのバリデーションスキーマ
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "リフレッシュトークンは必須です"),
});

/**
 * ログアウトリクエストのバリデーションスキーマ
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "リフレッシュトークンは必須です").optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;

