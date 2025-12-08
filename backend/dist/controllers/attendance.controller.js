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
exports.getMyAttendance = exports.getAttendanceByShift = exports.getAttendanceById = exports.generatePin = exports.updateStatus = exports.checkOut = exports.checkIn = void 0;
const AttendanceService = __importStar(require("../services/attendance.service"));
const zod_1 = require("zod");
const checkInSchema = zod_1.z.object({
    shift_id: zod_1.z.number().int().positive("シフトIDは正の整数である必要があります"),
    lat: zod_1.z.number().min(-90).max(90, "緯度は-90から90の範囲である必要があります"),
    lng: zod_1.z.number().min(-180).max(180, "経度は-180から180の範囲である必要があります"),
    pin: zod_1.z.string().regex(/^\d{6}$/, "PINコードは6桁の数字である必要があります").optional(),
});
const checkOutSchema = zod_1.z.object({
    attendance_id: zod_1.z.number().int().positive("出退勤IDは正の整数である必要があります"),
    lat: zod_1.z.number().min(-90).max(90, "緯度は-90から90の範囲である必要があります"),
    lng: zod_1.z.number().min(-180).max(180, "経度は-180から180の範囲である必要があります"),
    pin: zod_1.z.string().regex(/^\d{6}$/, "PINコードは6桁の数字である必要があります").optional(),
});
const updateStatusSchema = zod_1.z.object({
    attendance_id: zod_1.z.number().int().positive("出退勤IDは正の整数である必要があります"),
    status: zod_1.z.enum(["PENDING", "CONFIRMED", "REJECTED"], {
        message: "有効なステータスを選択してください",
    }),
    type: zod_1.z.enum(["check_in", "check_out"], {
        message: "有効なタイプを選択してください",
    }),
    pin: zod_1.z.string().regex(/^\d{6}$/, "PINコードは6桁の数字である必要があります").optional(),
});
const generatePinSchema = zod_1.z.object({
    purpose: zod_1.z.enum(["CHECK_IN", "CHECK_OUT", "STATUS_UPDATE"], {
        message: "有効な目的を選択してください",
    }),
    attendance_id: zod_1.z.number().int().positive().optional(),
});
const httpError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
const checkIn = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const { shift_id, lat, lng, pin } = checkInSchema.parse(req.body);
        const attendance = await AttendanceService.checkIn(shift_id, userId, lat, lng, pin);
        res.status(201).json(attendance);
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
            message: error.message || "チェックインに失敗しました",
        });
    }
};
exports.checkIn = checkIn;
const checkOut = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const { attendance_id, lat, lng, pin } = checkOutSchema.parse(req.body);
        const result = await AttendanceService.checkOut(attendance_id, userId, lat, lng, pin);
        res.json(result);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "チェックアウトに失敗しました",
        });
    }
};
exports.checkOut = checkOut;
const updateStatus = async (req, res) => {
    try {
        const { attendance_id, status, type, pin } = updateStatusSchema.parse(req.body);
        const attendance = await AttendanceService.updateAttendanceStatus(attendance_id, status, type, pin);
        res.json(attendance);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ステータス更新に失敗しました",
        });
    }
};
exports.updateStatus = updateStatus;
const generatePin = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const { purpose, attendance_id } = generatePinSchema.parse(req.body);
        const pin = await AttendanceService.generatePin(userId, purpose, attendance_id);
        res.json({ pin, expires_in: 600 }); // 10分
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "PIN生成に失敗しました",
        });
    }
};
exports.generatePin = generatePin;
const getAttendanceById = async (req, res) => {
    try {
        const attendance = await AttendanceService.getAttendanceById(Number(req.params.id));
        if (!attendance) {
            return res.status(404).json({ message: "出退勤記録が見つかりません" });
        }
        res.json(attendance);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "出退勤記録の取得に失敗しました",
        });
    }
};
exports.getAttendanceById = getAttendanceById;
const getAttendanceByShift = async (req, res) => {
    try {
        const attendance = await AttendanceService.getAttendanceByShiftId(Number(req.params.shift_id));
        res.json(attendance);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "出退勤記録の取得に失敗しました",
        });
    }
};
exports.getAttendanceByShift = getAttendanceByShift;
const getMyAttendance = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const limit = Number(req.query.limit) || 50;
        const attendance = await AttendanceService.getAttendanceByUserId(userId, limit);
        res.json(attendance);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "出退勤記録の取得に失敗しました",
        });
    }
};
exports.getMyAttendance = getMyAttendance;
