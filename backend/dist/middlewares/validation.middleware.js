"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validate = void 0;
const zod_1 = require("zod");
/**
 * Zodスキーマを使用したリクエストバリデーションミドルウェア
 * @param schema - Zodスキーマ
 * @param source - 検証するソース ('body' | 'query' | 'params')
 */
const validate = (schema, source = "body") => {
    return (req, res, next) => {
        try {
            const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
            const result = schema.safeParse(data);
            if (!result.success) {
                const errors = result.error.issues.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));
                return res.status(400).json({
                    message: "バリデーションエラー",
                    errors,
                });
            }
            // バリデーション済みのデータを設定
            if (source === "body") {
                req.body = result.data;
            }
            else if (source === "query") {
                // req.queryは読み取り専用なので、validatedQueryに保存
                req.validatedQuery = result.data;
            }
            else {
                // req.paramsも読み取り専用の可能性があるので、validatedParamsに保存
                req.validatedParams = result.data;
                // ただし、paramsは通常書き込み可能なので試行
                try {
                    Object.assign(req.params, result.data);
                }
                catch {
                    // 書き込みできない場合はvalidatedParamsのみ使用
                }
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    message: "バリデーションエラー",
                    errors: error.issues.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};
exports.validate = validate;
/**
 * クエリパラメータのバリデーション
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const errors = result.error.issues.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));
                return res.status(400).json({
                    message: "クエリパラメータのバリデーションエラー",
                    errors,
                });
            }
            // req.queryは読み取り専用なので、validatedQueryに保存
            req.validatedQuery = result.data;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    message: "クエリパラメータのバリデーションエラー",
                    errors: error.issues.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
/**
 * パスパラメータのバリデーション
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                const errors = result.error.issues.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));
                return res.status(400).json({
                    message: "パスパラメータのバリデーションエラー",
                    errors,
                });
            }
            // req.paramsに直接代入を試行、失敗した場合はvalidatedParamsに保存
            try {
                Object.assign(req.params, result.data);
            }
            catch {
                req.validatedParams = result.data;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    message: "パスパラメータのバリデーションエラー",
                    errors: error.issues.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
