"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVitalSchema = exports.createVitalSchema = void 0;
const zod_1 = require("zod");
exports.createVitalSchema = zod_1.z.object({
    resident_id: zod_1.z.string().min(1, "入居者IDは必須です").max(50), // VARCHAR(50)
    measured_at: zod_1.z.string().datetime("測定日時は有効な日時形式である必要があります"),
    systolic_bp: zod_1.z.number().int().min(0).max(300, "収縮期血圧は0-300の範囲で入力してください").optional().nullable(),
    diastolic_bp: zod_1.z.number().int().min(0).max(300, "拡張期血圧は0-300の範囲で入力してください").optional().nullable(),
    pulse: zod_1.z.number().int().min(0).max(300, "脈拍は0-300の範囲で入力してください").optional().nullable(),
    temperature: zod_1.z.number().min(30).max(45, "体温は30-45度の範囲で入力してください").optional().nullable(),
    spo2: zod_1.z.number().int().min(0).max(100, "SpO2は0-100の範囲で入力してください").optional().nullable(),
    note: zod_1.z.string().max(1000).optional().nullable(),
});
exports.updateVitalSchema = exports.createVitalSchema.partial();
