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
exports.getAttendanceByShiftAndUser = exports.getAttendanceByUserId = exports.getAttendanceByShiftId = exports.getAttendanceById = exports.generatePin = exports.updateAttendanceStatus = exports.checkOut = exports.checkIn = void 0;
const AttendanceModel = __importStar(require("../models/attendance.model"));
const PinVerificationModel = __importStar(require("../models/pinVerification.model"));
const ShiftModel = __importStar(require("../models/shift.model"));
const cache_1 = require("../utils/cache");
/**
 * GPS座標間の距離を計算（Haversine formula）
 * 戻り値: キロメートル
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球の半径（km）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * チェックイン（GPS位置情報付き）
 */
const checkIn = async (shift_id, user_id, lat, lng, pin) => {
    // シフト情報を取得
    const shift = await ShiftModel.getShiftById(shift_id);
    if (!shift) {
        const error = new Error("シフトが見つかりません");
        error.status = 404;
        throw error;
    }
    if (String(shift.nurse_id) !== String(user_id)) {
        const error = new Error("このシフトはあなたのシフトではありません");
        error.status = 403;
        throw error;
    }
    // 既存の出退勤記録を確認
    const existing = await AttendanceModel.getAttendanceByShiftAndUser(shift_id, user_id);
    if (existing && existing.check_in_at) {
        const error = new Error("既にチェックイン済みです");
        error.status = 400;
        throw error;
    }
    // PIN認証（PINが提供されている場合）
    if (pin) {
        const pinVerification = await PinVerificationModel.getPinVerificationByPin(pin);
        if (!pinVerification) {
            const error = new Error("無効なPINコードです");
            error.status = 400;
            throw error;
        }
        if (pinVerification.user_id !== user_id) {
            const error = new Error("このPINコードはあなたのものではありません");
            error.status = 403;
            throw error;
        }
        if (pinVerification.purpose !== "CHECK_IN") {
            const error = new Error("このPINコードはチェックイン用ではありません");
            error.status = 400;
            throw error;
        }
        // PINを使用済みにマーク
        await PinVerificationModel.markPinAsUsed(pin);
    }
    // 出退勤記録を作成または更新
    const attendanceData = {
        shift_id,
        user_id,
        check_in_at: new Date().toISOString(),
        check_in_lat: lat,
        check_in_lng: lng,
        check_in_status: pin ? "CONFIRMED" : "PENDING",
        check_in_pin: pin ?? null,
    };
    let attendance;
    if (existing) {
        attendance = await AttendanceModel.updateAttendance(existing.id, {
            ...attendanceData,
            check_in_status: pin ? "CONFIRMED" : "PENDING",
        });
    }
    else {
        attendance = await AttendanceModel.createAttendance(attendanceData);
    }
    // シフト関連のキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATES);
    return attendance;
};
exports.checkIn = checkIn;
/**
 * チェックアウト（GPS位置情報付き）
 */
const checkOut = async (attendance_id, user_id, lat, lng, pin) => {
    const attendance = await AttendanceModel.getAttendanceById(attendance_id);
    if (!attendance) {
        const error = new Error("出退勤記録が見つかりません");
        error.status = 404;
        throw error;
    }
    if (attendance.user_id !== user_id) {
        const error = new Error("この出退勤記録はあなたのものではありません");
        error.status = 403;
        throw error;
    }
    if (!attendance.check_in_at) {
        const error = new Error("チェックインされていません");
        error.status = 400;
        throw error;
    }
    if (attendance.check_out_at) {
        const error = new Error("既にチェックアウト済みです");
        error.status = 400;
        throw error;
    }
    // PIN認証（PINが提供されている場合）
    if (pin) {
        const pinVerification = await PinVerificationModel.getPinVerificationByPin(pin);
        if (!pinVerification) {
            throw new Error("無効なPINコードです");
        }
        if (pinVerification.user_id !== user_id) {
            throw new Error("このPINコードはあなたのものではありません");
        }
        if (pinVerification.purpose !== "CHECK_OUT") {
            throw new Error("このPINコードはチェックアウト用ではありません");
        }
        // PINを使用済みにマーク
        await PinVerificationModel.markPinAsUsed(pin);
    }
    // チェックイン位置との距離を計算
    let distance_km = null;
    if (attendance.check_in_lat && attendance.check_in_lng) {
        distance_km = calculateDistance(attendance.check_in_lat, attendance.check_in_lng, lat, lng);
    }
    const updated = await AttendanceModel.updateAttendance(attendance_id, {
        check_out_at: new Date().toISOString(),
        check_out_lat: lat,
        check_out_lng: lng,
        check_out_status: pin ? "CONFIRMED" : "PENDING",
        check_out_pin: pin ?? null,
    });
    return { ...updated, distance_km };
};
exports.checkOut = checkOut;
/**
 * 出退勤ステータスの確認・更新
 */
const updateAttendanceStatus = async (attendance_id, status, type, pin) => {
    const attendance = await AttendanceModel.getAttendanceById(attendance_id);
    if (!attendance) {
        throw new Error("出退勤記録が見つかりません");
    }
    // PIN認証（PINが提供されている場合）
    if (pin) {
        const pinVerification = await PinVerificationModel.getPinVerificationByPin(pin);
        if (!pinVerification) {
            throw new Error("無効なPINコードです");
        }
        if (pinVerification.purpose !== "STATUS_UPDATE") {
            throw new Error("このPINコードはステータス更新用ではありません");
        }
        // PINを使用済みにマーク
        await PinVerificationModel.markPinAsUsed(pin);
    }
    const updateData = {};
    if (type === "check_in") {
        updateData.check_in_status = status;
    }
    else {
        updateData.check_out_status = status;
    }
    return AttendanceModel.updateAttendance(attendance_id, updateData);
};
exports.updateAttendanceStatus = updateAttendanceStatus;
/**
 * PINコードを生成
 */
const generatePin = async (user_id, purpose, attendance_id) => {
    // 6桁のランダムPINを生成
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    // 有効期限: 10分
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    await PinVerificationModel.createPinVerification({
        user_id,
        pin,
        purpose,
        attendance_id: attendance_id ?? null,
        expires_at: expiresAt,
    });
    return pin;
};
exports.generatePin = generatePin;
exports.getAttendanceById = AttendanceModel.getAttendanceById;
exports.getAttendanceByShiftId = AttendanceModel.getAttendanceByShiftId;
exports.getAttendanceByUserId = AttendanceModel.getAttendanceByUserId;
exports.getAttendanceByShiftAndUser = AttendanceModel.getAttendanceByShiftAndUser;
