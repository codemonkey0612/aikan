"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
/**
 * ユーザーロールのバリデーション
 */
const userRoleSchema = zod_1.z.enum(["admin", "nurse", "facility_manager", "corporate_officer"]);
/**
 * 登録リクエストのバリデーションスキーマ
 */
exports.registerSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, "名は必須です").max(100, "名は100文字以内で入力してください").optional(),
    last_name: zod_1.z.string().min(1, "姓は必須です").max(100, "姓は100文字以内で入力してください").optional(),
    email: zod_1.z
        .string()
        .min(1, "メールアドレスは必須です")
        .email("有効なメールアドレスを入力してください")
        .max(255, "メールアドレスは255文字以内で入力してください"),
    phone_number: zod_1.z
        .string()
        .regex(/^[0-9-]+$/, "電話番号は数字とハイフンのみ使用できます")
        .max(30, "電話番号は30文字以内で入力してください")
        .optional()
        .nullable(),
    role: userRoleSchema.default("nurse"),
    password: zod_1.z
        .string()
        .min(6, "パスワードは6文字以上である必要があります")
        .max(100, "パスワードは100文字以内で入力してください")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "パスワードは大文字、小文字、数字を含む必要があります"),
});
/**
 * ログインリクエストのバリデーションスキーマ
 */
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, "メールアドレスは必須です")
        .email("有効なメールアドレスを入力してください"),
    password: zod_1.z.string().min(1, "パスワードは必須です"),
});
/**
 * リフレッシュトークンリクエストのバリデーションスキーマ
 */
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "リフレッシュトークンは必須です"),
});
/**
 * ログアウトリクエストのバリデーションスキーマ
 */
exports.logoutSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "リフレッシュトークンは必須です").optional(),
});
