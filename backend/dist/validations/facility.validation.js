"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFacilitySchema = exports.createFacilitySchema = void 0;
const zod_1 = require("zod");
exports.createFacilitySchema = zod_1.z.object({
    corporation_id: zod_1.z.number().int().positive("法人IDは正の整数である必要があります"),
    name: zod_1.z.string().min(1, "施設名は必須です").max(255, "施設名は255文字以内で入力してください"),
    code: zod_1.z.string().max(50).optional().nullable(),
    postal_code: zod_1.z.string().regex(/^\d{3}-?\d{4}$/, "郵便番号の形式が正しくありません").optional().nullable(),
    address: zod_1.z.string().max(500).optional().nullable(),
    lat: zod_1.z.number().min(-90).max(90).optional().nullable(),
    lng: zod_1.z.number().min(-180).max(180).optional().nullable(),
});
exports.updateFacilitySchema = exports.createFacilitySchema.partial();
