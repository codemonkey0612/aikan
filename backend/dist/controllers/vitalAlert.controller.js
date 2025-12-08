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
exports.acknowledgeVitalAlertTrigger = exports.getVitalAlertTriggers = exports.deleteVitalAlert = exports.updateVitalAlert = exports.createVitalAlert = exports.getVitalAlertsByResident = exports.getVitalAlertById = exports.getAllVitalAlerts = void 0;
const VitalAlertService = __importStar(require("../services/vitalAlert.service"));
const zod_1 = require("zod");
const createVitalAlertSchema = zod_1.z.object({
    resident_id: zod_1.z
        .string()
        .trim()
        .min(1, "入居者IDは必須です"),
    alert_type: zod_1.z.enum(["SYSTOLIC_BP", "DIASTOLIC_BP", "PULSE", "TEMPERATURE", "SPO2"], {
        message: "有効なアラートタイプを選択してください",
    }),
    min_value: zod_1.z.number().optional(),
    max_value: zod_1.z.number().optional(),
    severity: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    active: zod_1.z.boolean().optional(),
});
const updateVitalAlertSchema = createVitalAlertSchema.partial();
const acknowledgeAlertSchema = zod_1.z.object({
    notes: zod_1.z.string().optional().or(zod_1.z.literal("")),
});
const getAllVitalAlerts = async (req, res) => {
    try {
        const alerts = await VitalAlertService.getAllVitalAlerts();
        res.json(alerts);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "バイタルアラートの取得に失敗しました",
        });
    }
};
exports.getAllVitalAlerts = getAllVitalAlerts;
const getVitalAlertById = async (req, res) => {
    try {
        const alert = await VitalAlertService.getVitalAlertById(Number(req.params.id));
        if (!alert) {
            return res.status(404).json({ message: "バイタルアラートが見つかりません" });
        }
        res.json(alert);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "バイタルアラートの取得に失敗しました",
        });
    }
};
exports.getVitalAlertById = getVitalAlertById;
const getVitalAlertsByResident = async (req, res) => {
    try {
        const alerts = await VitalAlertService.getVitalAlertsByResident(req.params.resident_id);
        res.json(alerts);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "バイタルアラートの取得に失敗しました",
        });
    }
};
exports.getVitalAlertsByResident = getVitalAlertsByResident;
const createVitalAlert = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        const data = createVitalAlertSchema.parse(req.body);
        const alert = await VitalAlertService.createVitalAlert({
            ...data,
            created_by: userId,
        });
        res.status(201).json(alert);
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
            message: error.message || "バイタルアラートの作成に失敗しました",
        });
    }
};
exports.createVitalAlert = createVitalAlert;
const updateVitalAlert = async (req, res) => {
    try {
        const data = updateVitalAlertSchema.parse(req.body);
        const alert = await VitalAlertService.updateVitalAlert(Number(req.params.id), data);
        res.json(alert);
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
            message: error.message || "バイタルアラートの更新に失敗しました",
        });
    }
};
exports.updateVitalAlert = updateVitalAlert;
const deleteVitalAlert = async (req, res) => {
    try {
        await VitalAlertService.deleteVitalAlert(Number(req.params.id));
        res.json({ message: "削除しました" });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "バイタルアラートの削除に失敗しました",
        });
    }
};
exports.deleteVitalAlert = deleteVitalAlert;
const getVitalAlertTriggers = async (req, res) => {
    try {
        const resident_id = req.query.resident_id
            ? String(req.query.resident_id)
            : undefined;
        const acknowledged = req.query.acknowledged === "true"
            ? true
            : req.query.acknowledged === "false"
                ? false
                : undefined;
        const triggers = await VitalAlertService.getVitalAlertTriggers(resident_id, acknowledged);
        res.json(triggers);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "アラートトリガーの取得に失敗しました",
        });
    }
};
exports.getVitalAlertTriggers = getVitalAlertTriggers;
const acknowledgeVitalAlertTrigger = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const { notes } = acknowledgeAlertSchema.parse(req.body);
        const trigger = await VitalAlertService.acknowledgeVitalAlertTrigger(Number(req.params.id), userId, notes);
        res.json(trigger);
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
            message: error.message || "アラートの確認に失敗しました",
        });
    }
};
exports.acknowledgeVitalAlertTrigger = acknowledgeVitalAlertTrigger;
