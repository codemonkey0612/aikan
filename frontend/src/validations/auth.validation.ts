import { z } from "zod";

/**
 * ログインフォームのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
});

/**
 * 登録フォームのバリデーションスキーマ
 */
export const registerSchema = z
  .object({
    first_name: z.string().min(1, "名は必須です").max(100).optional(),
    last_name: z.string().min(1, "姓は必須です").max(100).optional(),
    email: z
      .string()
      .min(1, "メールアドレスは必須です")
      .email("有効なメールアドレスを入力してください"),
    phone: z
      .string()
      .regex(/^[0-9-]+$/, "電話番号は数字とハイフンのみ使用できます")
      .max(20)
      .optional(),
    role: z.enum(["admin", "nurse", "facility_manager", "corporate_officer"]).default("admin"),
    password: z
      .string()
      .min(6, "パスワードは6文字以上である必要があります")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "パスワードは大文字、小文字、数字を含む必要があります"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

