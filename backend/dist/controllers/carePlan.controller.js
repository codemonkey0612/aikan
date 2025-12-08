"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCarePlanItem = exports.updateCarePlanItem = exports.createCarePlanItem = exports.getCarePlanItems = exports.deleteCarePlan = exports.updateCarePlan = exports.createCarePlan = exports.getCarePlansByResident = exports.getCarePlanById = exports.getAllCarePlans = void 0;
const CarePlanService = __importStar(require("../services/carePlan.service"));
const zod_1 = require("zod");
const createCarePlanSchema = zod_1.z.object({
    resident_id: zod_1.z
        .string()
        .trim()
        .min(1, "入居者IDは必須です"),
    title: zod_1.z.string().min(1, "タイトルは必須です").max(255),
    description: zod_1.z.string().optional().or(zod_1.z.literal("")),
    start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)"),
    end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(zod_1.z.literal("")),
    status: zod_1.z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});
const updateCarePlanSchema = createCarePlanSchema.partial();
const createCarePlanItemSchema = zod_1.z.object({
    care_plan_id: zod_1.z.number().int().positive("ケアプランIDは正の整数である必要があります"),
    task_description: zod_1.z.string().min(1, "タスク説明は必須です"),
    frequency: zod_1.z.string().max(100).optional().or(zod_1.z.literal("")),
    assigned_to: zod_1.z.number().int().positive().optional(),
    due_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(zod_1.z.literal("")),
});
const updateCarePlanItemSchema = zod_1.z.object({
    task_description: zod_1.z.string().min(1).optional(),
    frequency: zod_1.z.string().max(100).optional().or(zod_1.z.literal("")),
    assigned_to: zod_1.z.number().int().positive().optional(),
    due_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(zod_1.z.literal("")),
    completed: zod_1.z.boolean().optional(),
    completed_by: zod_1.z.number().int().positive().optional(),
});
const getAllCarePlans = async (req, res) => {
    try {
        const carePlans = await CarePlanService.getAllCarePlans();
        res.json(carePlans);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプランの取得に失敗しました",
        });
    }
};
exports.getAllCarePlans = getAllCarePlans;
const getCarePlanById = async (req, res) => {
    try {
        const carePlan = await CarePlanService.getCarePlanById(Number(req.params.id));
        if (!carePlan) {
            return res.status(404).json({ message: "ケアプランが見つかりません" });
        }
        res.json(carePlan);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプランの取得に失敗しました",
        });
    }
};
exports.getCarePlanById = getCarePlanById;
const getCarePlansByResident = async (req, res) => {
    try {
        const carePlans = await CarePlanService.getCarePlansByResident(req.params.resident_id);
        res.json(carePlans);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプランの取得に失敗しました",
        });
    }
};
exports.getCarePlansByResident = getCarePlansByResident;
const createCarePlan = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        const data = createCarePlanSchema.parse(req.body);
        const carePlan = await CarePlanService.createCarePlan({
            ...data,
            created_by: userId,
        });
        res.status(201).json(carePlan);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "バリデーションエラー",
                errors: error.issues.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプランの作成に失敗しました",
        });
    }
};
exports.createCarePlan = createCarePlan;
const updateCarePlan = async (req, res) => {
    try {
        const data = updateCarePlanSchema.parse(req.body);
        const carePlan = await CarePlanService.updateCarePlan(Number(req.params.id), data);
        res.json(carePlan);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "バリデーションエラー",
                errors: error.issues.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプランの更新に失敗しました",
        });
    }
};
exports.updateCarePlan = updateCarePlan;
const deleteCarePlan = async (req, res) => {
    try {
        await CarePlanService.deleteCarePlan(Number(req.params.id));
        res.json({ message: "削除しました" });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプランの削除に失敗しました",
        });
    }
};
exports.deleteCarePlan = deleteCarePlan;
// Care Plan Items
const getCarePlanItems = async (req, res) => {
    try {
        const items = await CarePlanService.getCarePlanItems(Number(req.params.care_plan_id));
        res.json(items);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプラン項目の取得に失敗しました",
        });
    }
};
exports.getCarePlanItems = getCarePlanItems;
const createCarePlanItem = async (req, res) => {
    try {
        const data = createCarePlanItemSchema.parse(req.body);
        const item = await CarePlanService.createCarePlanItem(data);
        res.status(201).json(item);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "バリデーションエラー",
                errors: error.issues.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプラン項目の作成に失敗しました",
        });
    }
};
exports.createCarePlanItem = createCarePlanItem;
const updateCarePlanItem = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        const data = updateCarePlanItemSchema.parse(req.body);
        // completedがtrueの場合、completed_byを設定
        if (data.completed && !data.completed_by) {
            data.completed_by = userId;
        }
        const item = await CarePlanService.updateCarePlanItem(Number(req.params.id), data);
        res.json(item);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "バリデーションエラー",
                errors: error.issues.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプラン項目の更新に失敗しました",
        });
    }
};
exports.updateCarePlanItem = updateCarePlanItem;
const deleteCarePlanItem = async (req, res) => {
    try {
        await CarePlanService.deleteCarePlanItem(Number(req.params.id));
        res.json({ message: "削除しました" });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ケアプラン項目の削除に失敗しました",
        });
    }
};
exports.deleteCarePlanItem = deleteCarePlanItem;
