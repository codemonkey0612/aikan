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
exports.deleteMedicationNote = exports.updateMedicationNote = exports.createMedicationNote = exports.getActiveMedicationNotesByResident = exports.getMedicationNotesByResident = exports.getMedicationNoteById = exports.getAllMedicationNotes = void 0;
const MedicationNoteService = __importStar(require("../services/medicationNote.service"));
const zod_1 = require("zod");
const createMedicationNoteSchema = zod_1.z.object({
    resident_id: zod_1.z
        .string()
        .trim()
        .min(1, "入居者IDは必須です"),
    medication_name: zod_1.z.string().min(1, "薬剤名は必須です").max(255),
    dosage: zod_1.z.string().max(100).optional().or(zod_1.z.literal("")),
    frequency: zod_1.z.string().max(100).optional().or(zod_1.z.literal("")),
    route: zod_1.z.string().max(50).optional().or(zod_1.z.literal("")),
    start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(zod_1.z.literal("")),
    end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください (YYYY-MM-DD)").optional().or(zod_1.z.literal("")),
    prescribed_by: zod_1.z.string().max(255).optional().or(zod_1.z.literal("")),
    notes: zod_1.z.string().optional().or(zod_1.z.literal("")),
    status: zod_1.z.enum(["ACTIVE", "DISCONTINUED", "COMPLETED"]).optional(),
});
const updateMedicationNoteSchema = createMedicationNoteSchema.partial();
const getAllMedicationNotes = async (req, res) => {
    try {
        const notes = await MedicationNoteService.getAllMedicationNotes();
        res.json(notes);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "薬剤メモの取得に失敗しました",
        });
    }
};
exports.getAllMedicationNotes = getAllMedicationNotes;
const getMedicationNoteById = async (req, res) => {
    try {
        const note = await MedicationNoteService.getMedicationNoteById(Number(req.params.id));
        if (!note) {
            return res.status(404).json({ message: "薬剤メモが見つかりません" });
        }
        res.json(note);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "薬剤メモの取得に失敗しました",
        });
    }
};
exports.getMedicationNoteById = getMedicationNoteById;
const getMedicationNotesByResident = async (req, res) => {
    try {
        const notes = await MedicationNoteService.getMedicationNotesByResident(req.params.resident_id);
        res.json(notes);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "薬剤メモの取得に失敗しました",
        });
    }
};
exports.getMedicationNotesByResident = getMedicationNotesByResident;
const getActiveMedicationNotesByResident = async (req, res) => {
    try {
        const notes = await MedicationNoteService.getActiveMedicationNotesByResident(req.params.resident_id);
        res.json(notes);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "薬剤メモの取得に失敗しました",
        });
    }
};
exports.getActiveMedicationNotesByResident = getActiveMedicationNotesByResident;
const createMedicationNote = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        const data = createMedicationNoteSchema.parse(req.body);
        const note = await MedicationNoteService.createMedicationNote({
            ...data,
            created_by: userId,
        });
        res.status(201).json(note);
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
            message: error.message || "薬剤メモの作成に失敗しました",
        });
    }
};
exports.createMedicationNote = createMedicationNote;
const updateMedicationNote = async (req, res) => {
    try {
        const data = updateMedicationNoteSchema.parse(req.body);
        const note = await MedicationNoteService.updateMedicationNote(Number(req.params.id), data);
        res.json(note);
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
            message: error.message || "薬剤メモの更新に失敗しました",
        });
    }
};
exports.updateMedicationNote = updateMedicationNote;
const deleteMedicationNote = async (req, res) => {
    try {
        await MedicationNoteService.deleteMedicationNote(Number(req.params.id));
        res.json({ message: "削除しました" });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "薬剤メモの削除に失敗しました",
        });
    }
};
exports.deleteMedicationNote = deleteMedicationNote;
