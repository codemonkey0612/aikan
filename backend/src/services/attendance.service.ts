import * as AttendanceModel from "../models/attendance.model";
import * as PinVerificationModel from "../models/pinVerification.model";
import * as ShiftModel from "../models/shift.model";
import { invalidateCache, CACHE_KEYS } from "../utils/cache";

/**
 * GPS座標間の距離を計算（Haversine formula）
 * 戻り値: キロメートル
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 地球の半径（km）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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
export const checkIn = async (
  shift_id: number,
  user_id: number,
  lat: number,
  lng: number,
  pin?: string
) => {
  // シフト情報を取得
  const shift = await ShiftModel.getShiftById(shift_id);
  if (!shift) {
    const error = new Error("シフトが見つかりません");
    (error as any).status = 404;
    throw error;
  }

  if (shift.nurse_id !== user_id) {
    const error = new Error("このシフトはあなたのシフトではありません");
    (error as any).status = 403;
    throw error;
  }

  // 既存の出退勤記録を確認
  const existing = await AttendanceModel.getAttendanceByShiftAndUser(
    shift_id,
    user_id
  );
  if (existing && existing.check_in_at) {
    const error = new Error("既にチェックイン済みです");
    (error as any).status = 400;
    throw error;
  }

  // PIN認証（PINが提供されている場合）
  if (pin) {
    const pinVerification = await PinVerificationModel.getPinVerificationByPin(
      pin
    );
    if (!pinVerification) {
      const error = new Error("無効なPINコードです");
      (error as any).status = 400;
      throw error;
    }
    if (pinVerification.user_id !== user_id) {
      const error = new Error("このPINコードはあなたのものではありません");
      (error as any).status = 403;
      throw error;
    }
    if (pinVerification.purpose !== "CHECK_IN") {
      const error = new Error("このPINコードはチェックイン用ではありません");
      (error as any).status = 400;
      throw error;
    }
    // PINを使用済みにマーク
    await PinVerificationModel.markPinAsUsed(pin);
  }

  // 出退勤記録を作成または更新
  const attendanceData: AttendanceModel.CreateAttendanceInput = {
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
  } else {
    attendance = await AttendanceModel.createAttendance(attendanceData);
  }

  // シフト関連のキャッシュを無効化
  await invalidateCache(CACHE_KEYS.SHIFT_TEMPLATES);

  return attendance;
};

/**
 * チェックアウト（GPS位置情報付き）
 */
export const checkOut = async (
  attendance_id: number,
  user_id: number,
  lat: number,
  lng: number,
  pin?: string
) => {
  const attendance = await AttendanceModel.getAttendanceById(attendance_id);
  if (!attendance) {
    const error = new Error("出退勤記録が見つかりません");
    (error as any).status = 404;
    throw error;
  }

  if (attendance.user_id !== user_id) {
    const error = new Error("この出退勤記録はあなたのものではありません");
    (error as any).status = 403;
    throw error;
  }

  if (!attendance.check_in_at) {
    const error = new Error("チェックインされていません");
    (error as any).status = 400;
    throw error;
  }

  if (attendance.check_out_at) {
    const error = new Error("既にチェックアウト済みです");
    (error as any).status = 400;
    throw error;
  }

  // PIN認証（PINが提供されている場合）
  if (pin) {
    const pinVerification = await PinVerificationModel.getPinVerificationByPin(
      pin
    );
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
  let distance_km: number | null = null;
  if (attendance.check_in_lat && attendance.check_in_lng) {
    distance_km = calculateDistance(
      attendance.check_in_lat,
      attendance.check_in_lng,
      lat,
      lng
    );
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

/**
 * 出退勤ステータスの確認・更新
 */
export const updateAttendanceStatus = async (
  attendance_id: number,
  status: AttendanceModel.AttendanceStatus,
  type: "check_in" | "check_out",
  pin?: string
) => {
  const attendance = await AttendanceModel.getAttendanceById(attendance_id);
  if (!attendance) {
    throw new Error("出退勤記録が見つかりません");
  }

  // PIN認証（PINが提供されている場合）
  if (pin) {
    const pinVerification = await PinVerificationModel.getPinVerificationByPin(
      pin
    );
    if (!pinVerification) {
      throw new Error("無効なPINコードです");
    }
    if (pinVerification.purpose !== "STATUS_UPDATE") {
      throw new Error("このPINコードはステータス更新用ではありません");
    }
    // PINを使用済みにマーク
    await PinVerificationModel.markPinAsUsed(pin);
  }

  const updateData: AttendanceModel.UpdateAttendanceInput = {};
  if (type === "check_in") {
    updateData.check_in_status = status;
  } else {
    updateData.check_out_status = status;
  }

  return AttendanceModel.updateAttendance(attendance_id, updateData);
};

/**
 * PINコードを生成
 */
export const generatePin = async (
  user_id: number,
  purpose: PinVerificationModel.PinPurpose,
  attendance_id?: number
): Promise<string> => {
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

export const getAttendanceById = AttendanceModel.getAttendanceById;
export const getAttendanceByShiftId = AttendanceModel.getAttendanceByShiftId;
export const getAttendanceByUserId = AttendanceModel.getAttendanceByUserId;
export const getAttendanceByShiftAndUser =
  AttendanceModel.getAttendanceByShiftAndUser;

