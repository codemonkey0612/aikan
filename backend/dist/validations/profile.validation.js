"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
/**
 * プロフィール更新のバリデーションスキーマ
 */
exports.updateProfileSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, "名は必須です").max(100).optional().nullable(),
    last_name: zod_1.z.string().min(1, "姓は必須です").max(100).optional().nullable(),
    email: zod_1.z
        .string()
        .email("有効なメールアドレスを入力してください")
        .max(255)
        .optional()
        .nullable(),
    phone_number: zod_1.z
        .string()
        .regex(/^[0-9-]+$/, "電話番号は数字とハイフンのみ使用できます")
        .max(30)
        .optional()
        .nullable(),
});
/**
 * パスワード変更のバリデーションスキーマ
 */
exports.changePasswordSchema = zod_1.z
    .object({
    current_password: zod_1.z.string().min(1, "現在のパスワードは必須です"),
    new_password: zod_1.z
        .string()
        .min(6, "パスワードは6文字以上である必要があります")
        .max(100),
    confirm_password: zod_1.z.string().min(1, "パスワード確認は必須です"),
})
    .refine((data) => data.new_password === data.confirm_password, {
    message: "新しいパスワードと確認パスワードが一致しません",
    path: ["confirm_password"],
});
