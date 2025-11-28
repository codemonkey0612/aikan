import { z } from "zod";

/**
 * ページネーション用の共通バリデーションスキーマ
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "ページ番号は数値である必要があります")
    .default("1")
    .transform(Number)
    .pipe(z.number().int().min(1, "ページ番号は1以上である必要があります")),
  limit: z
    .string()
    .regex(/^\d+$/, "件数は数値である必要があります")
    .default("20")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100, "件数は100件以下である必要があります")),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * ページネーション結果の型
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * ページネーション計算ヘルパー
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginatedResponse<never>["pagination"] {
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

