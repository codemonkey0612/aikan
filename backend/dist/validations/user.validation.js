"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const userRoleSchema = zod_1.z.enum(["admin", "nurse", "facility_manager", "corporate_officer"]);
/**
 * ユーザー作成のバリデーションスキーマ
 */
exports.createUserSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, "名は必須です").max(100).optional().nullable(),
    last_name: zod_1.z.string().min(1, "姓は必須です").max(100).optional().nullable(),
    email: zod_1.z
        .string()
        .min(1, "メールアドレスは必須です")
        .email("有効なメールアドレスを入力してください")
        .max(255),
    phone_number: zod_1.z.string().regex(/^[0-9-]+$/).max(30).optional().nullable(),
    role: userRoleSchema.optional(),
    password: zod_1.z
        .string()
        .min(6, "パスワードは6文字以上である必要があります")
        .max(100)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "パスワードは大文字、小文字、数字を含む必要があります"),
});
/**
 * ユーザー更新のバリデーションスキーマ
 */
exports.updateUserSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1).max(100).optional().nullable(),
    last_name: zod_1.z.string().min(1).max(100).optional().nullable(),
    email: zod_1.z.string().email().max(255).optional(),
    phone_number: zod_1.z.string().regex(/^[0-9-]+$/).max(30).optional().nullable(),
    role: userRoleSchema.optional(),
    password: zod_1.z
        .string()
        .min(6)
        .max(100)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .optional(),
});
