import { useState } from "react";
import toast from "react-hot-toast";
import { useCheckIn, useCheckOut, useGeneratePin } from "../../hooks/useAttendance";
import { useGeolocation } from "../../hooks/useGeolocation";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { Attendance, PinPurpose } from "../../api/types";

interface CheckInOutFormProps {
  shiftId: number;
  attendance?: Attendance | null;
  onSuccess?: () => void;
}

export function CheckInOutForm({ shiftId, attendance, onSuccess }: CheckInOutFormProps) {
  const [pin, setPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);

  const { latitude, longitude, error: geoError, loading: geoLoading, getCurrentPosition } = useGeolocation();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const generatePinMutation = useGeneratePin();

  const isCheckedIn = attendance?.check_in_at && !attendance?.check_out_at;
  const isCheckedOut = attendance?.check_out_at;

  const handleGetLocation = () => {
    getCurrentPosition();
  };

  const handleGeneratePin = async (purpose: PinPurpose) => {
    try {
      const result = await generatePinMutation.mutateAsync({
        purpose,
        attendance_id: attendance?.id,
      });
      setGeneratedPin(result.pin);
      setShowPinInput(true);
      toast.success("PINを生成しました");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "PIN生成に失敗しました");
    }
  };

  const handleCheckIn = async () => {
    if (!latitude || !longitude) {
      toast.error("位置情報を取得してください");
      return;
    }

    try {
      await checkInMutation.mutateAsync({
        shift_id: shiftId,
        lat: latitude,
        lng: longitude,
        pin: pin || undefined,
      });
      setPin("");
      setShowPinInput(false);
      setGeneratedPin(null);
      onSuccess?.();
      toast.success("チェックインしました");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "チェックインに失敗しました");
    }
  };

  const handleCheckOut = async () => {
    if (!attendance?.id) {
      toast.error("出退勤記録が見つかりません");
      return;
    }

    if (!latitude || !longitude) {
      toast.error("位置情報を取得してください");
      return;
    }

    try {
      const result = await checkOutMutation.mutateAsync({
        attendance_id: attendance.id,
        lat: latitude,
        lng: longitude,
        pin: pin || undefined,
      });
      setPin("");
      setShowPinInput(false);
      setGeneratedPin(null);
      onSuccess?.();
      const distance = result.distance_km;
      toast.success(`チェックアウトしました${distance ? ` (移動距離: ${distance.toFixed(2)}km)` : ""}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "チェックアウトに失敗しました");
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <ClockIcon className="h-6 w-6 text-brand-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          {isCheckedOut ? "チェックアウト済み" : isCheckedIn ? "チェックアウト" : "チェックイン"}
        </h3>
      </div>

      {/* 位置情報取得 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          位置情報
        </label>
        <button
          onClick={handleGetLocation}
          disabled={geoLoading}
          className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <MapPinIcon className="h-5 w-5" />
          {geoLoading ? "取得中..." : latitude && longitude ? "位置情報を再取得" : "位置情報を取得"}
        </button>
        {geoError && (
          <p className="text-sm text-rose-600">{geoError}</p>
        )}
        {latitude && longitude && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-slate-600">
              緯度: {latitude.toFixed(7)}, 経度: {longitude.toFixed(7)}
            </p>
            {geoLoading && (
              <p className="text-xs text-slate-500">精度: ±{geoLoading}m</p>
            )}
          </div>
        )}
      </div>

      {/* PIN認証 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            PIN認証（オプション）
          </label>
          {!showPinInput && (
            <button
              onClick={() => handleGeneratePin(isCheckedIn ? "CHECK_OUT" : "CHECK_IN")}
              disabled={generatePinMutation.isPending}
              className="text-sm text-brand-600 hover:text-brand-500"
            >
              {generatePinMutation.isPending ? "生成中..." : "PINを生成"}
            </button>
          )}
        </div>
        {generatedPin && (
          <div className="rounded-lg bg-brand-50 p-3 text-center">
            <p className="text-sm font-semibold text-brand-700">
              生成されたPIN: {generatedPin}
            </p>
            <p className="text-xs text-brand-600">有効期限: 10分</p>
          </div>
        )}
        {showPinInput && (
          <div className="space-y-2">
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6桁のPINコード"
              maxLength={6}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-lg font-mono tracking-widest"
            />
            <button
              onClick={() => {
                setShowPinInput(false);
                setPin("");
                setGeneratedPin(null);
              }}
              className="w-full text-sm text-slate-600 hover:text-slate-800"
            >
              PIN入力をキャンセル
            </button>
          </div>
        )}
      </div>

      {/* チェックイン/アウトボタン */}
      {!isCheckedOut && (
        <button
          onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
          disabled={
            !latitude ||
            !longitude ||
            checkInMutation.isPending ||
            checkOutMutation.isPending ||
            geoLoading
          }
          className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
        >
          {checkInMutation.isPending || checkOutMutation.isPending
            ? "処理中..."
            : isCheckedIn
            ? "チェックアウト"
            : "チェックイン"}
        </button>
      )}

      {/* ステータス表示 */}
      {attendance && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">チェックイン:</span>
            <span
              className={`font-semibold ${
                attendance.check_in_status === "CONFIRMED"
                  ? "text-green-600"
                  : attendance.check_in_status === "REJECTED"
                  ? "text-rose-600"
                  : "text-yellow-600"
              }`}
            >
              {attendance.check_in_status === "CONFIRMED"
                ? "確認済み"
                : attendance.check_in_status === "REJECTED"
                ? "却下"
                : "確認待ち"}
            </span>
          </div>
          {attendance.check_out_at && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-slate-600">チェックアウト:</span>
              <span
                className={`font-semibold ${
                  attendance.check_out_status === "CONFIRMED"
                    ? "text-green-600"
                    : attendance.check_out_status === "REJECTED"
                    ? "text-rose-600"
                    : "text-yellow-600"
                }`}
              >
                {attendance.check_out_status === "CONFIRMED"
                  ? "確認済み"
                  : attendance.check_out_status === "REJECTED"
                  ? "却下"
                  : "確認待ち"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

