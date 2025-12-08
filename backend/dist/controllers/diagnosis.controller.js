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
exports.deleteDiagnosis = exports.updateDiagnosis = exports.createDiagnosis = exports.getDiagnosesByResident = exports.getDiagnosisById = exports.getAllDiagnoses = void 0;
const DiagnosisService = __importStar(require("../services/diagnosis.service"));
const zod_1 = require("zod");
const createDiagnosisSchema = zod_1.z.object({
    resident_id: zod_1.z
        .string()
        .trim()
        .min(1, "入居者IDは必須です"),
    diagnosis_code: zod_1.z.string().max(50).optional().or(zod_1.z.literal("")),
    diagnosis_name: zod_1.z.string().min(1, "診断名は必須です").max(255),
    diagnosis_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(zod_1.z.literal("")),
    severity: zod_1.z.string().max(50).optional().or(zod_1.z.literal("")),
    status: zod_1.z.string().max(50).optional().or(zod_1.z.literal("")),
    notes: zod_1.z.string().optional().or(zod_1.z.literal("")),
    diagnosed_by: zod_1.z.number().int().positive().optional(),
});
const updateDiagnosisSchema = createDiagnosisSchema.partial();
const getAllDiagnoses = async (req, res) => {
    try {
        const diagnoses = await DiagnosisService.getAllDiagnoses();
        res.json(diagnoses);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "診断の取得に失敗しました",
        });
    }
};
exports.getAllDiagnoses = getAllDiagnoses;
const getDiagnosisById = async (req, res) => {
    try {
        const diagnosis = await DiagnosisService.getDiagnosisById(Number(req.params.id));
        if (!diagnosis) {
            return res.status(404).json({ message: "診断が見つかりません" });
        }
        res.json(diagnosis);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "診断の取得に失敗しました",
        });
    }
};
exports.getDiagnosisById = getDiagnosisById;
const getDiagnosesByResident = async (req, res) => {
    try {
        const diagnoses = await DiagnosisService.getDiagnosesByResident(req.params.resident_id);
        res.json(diagnoses);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "診断の取得に失敗しました",
        });
    }
};
exports.getDiagnosesByResident = getDiagnosesByResident;
const createDiagnosis = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        const data = createDiagnosisSchema.parse(req.body);
        const diagnosis = await DiagnosisService.createDiagnosis({
            ...data,
            diagnosed_by: data.diagnosed_by ?? userId,
        });
        res.status(201).json(diagnosis);
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
            message: error.message || "診断の作成に失敗しました",
        });
    }
};
exports.createDiagnosis = createDiagnosis;
const updateDiagnosis = async (req, res) => {
    try {
        const data = updateDiagnosisSchema.parse(req.body);
        const diagnosis = await DiagnosisService.updateDiagnosis(Number(req.params.id), data);
        res.json(diagnosis);
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
            message: error.message || "診断の更新に失敗しました",
        });
    }
};
exports.updateDiagnosis = updateDiagnosis;
const deleteDiagnosis = async (req, res) => {
    try {
        await DiagnosisService.deleteDiagnosis(Number(req.params.id));
        res.json({ message: "削除しました" });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "診断の削除に失敗しました",
        });
    }
};
exports.deleteDiagnosis = deleteDiagnosis;
