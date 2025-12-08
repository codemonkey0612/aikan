"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationQuerySchema = void 0;
exports.calculatePagination = calculatePagination;
const zod_1 = require("zod");
/**
 * ページネーション用の共通バリデーションスキーマ
 */
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .regex(/^\d+$/, "ページ番号は数値である必要があります")
        .default("1")
        .transform(Number)
        .pipe(zod_1.z.number().int().min(1, "ページ番号は1以上である必要があります")),
    limit: zod_1.z
        .string()
        .regex(/^\d+$/, "件数は数値である必要があります")
        .default("20")
        .transform(Number)
        .pipe(zod_1.z.number().int().min(1).max(100, "件数は100件以下である必要があります")),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
});
/**
 * ページネーション計算ヘルパー
 */
function calculatePagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
