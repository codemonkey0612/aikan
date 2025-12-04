import { z } from "zod";

/**
 * プロフィール更新のバリデーションスキーマ
 */
export const updateProfileSchema = z.object({
  first_name: z.string().min(1, "名は必須です").max(100).optional().nullable(),
  last_name: z.string().min(1, "姓は必須です").max(100).optional().nullable(),
  email: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .max(255)
    .optional()
    .nullable(),
  phone_number: z
    .string()
    .regex(/^[0-9-]+$/, "電話番号は数字とハイフンのみ使用できます")
    .max(30)
    .optional()
    .nullable(),
});

/**
 * パスワード変更のバリデーションスキーマ
 */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "現在のパスワードは必須です"),
    new_password: z
      .string()
      .min(6, "パスワードは6文字以上である必要があります")
      .max(100),
    confirm_password: z.string().min(1, "パスワード確認は必須です"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "新しいパスワードと確認パスワードが一致しません",
    path: ["confirm_password"],
  });

