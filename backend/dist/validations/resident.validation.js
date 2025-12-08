"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResidentSchema = exports.createResidentSchema = void 0;
const zod_1 = require("zod");
const genderSchema = zod_1.z.enum(["MALE", "FEMALE", "OTHER"]);
exports.createResidentSchema = zod_1.z.object({
    resident_id: zod_1.z.string().min(1, "入所者IDは必須です").max(50),
    facility_id: zod_1.z.string().max(50).optional().nullable(), // VARCHAR(50)
    user_id: zod_1.z.string().max(50).optional().nullable(), // VARCHAR(50)
    status_id: zod_1.z.string().max(50).optional().nullable(), // VARCHAR(50)
    first_name: zod_1.z.string().min(1, "名は必須です").max(100).optional().nullable(),
    last_name: zod_1.z.string().min(1, "姓は必須です").max(100).optional().nullable(),
    gender: genderSchema.optional().nullable(),
    birth_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "生年月日はYYYY-MM-DD形式で入力してください").optional().nullable(),
    status: zod_1.z.string().max(100).optional().nullable(),
});
exports.updateResidentSchema = exports.createResidentSchema.partial();
