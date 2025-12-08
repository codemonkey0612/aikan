import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { User } from "../../api/types";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: User | null;
  mode?: "create" | "edit";
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode = "create",
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    first_name_kana: "",
    last_name_kana: "",
    email: "",
    phone_number: "",
    postal_code: "",
    address_prefecture: "",
    address_city: "",
    address_building: "",
    latitude_longitude: "",
    position: "",
    nurse_id: "",
    alcohol_check: false,
    notes: "",
    role: "admin" as User["role"],
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && user) {
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          first_name_kana: user.first_name_kana || "",
          last_name_kana: user.last_name_kana || "",
          email: user.email || "",
          phone_number: user.phone_number || "",
          postal_code: user.postal_code || "",
          address_prefecture: user.address_prefecture || "",
          address_city: user.address_city || "",
          address_building: user.address_building || "",
          latitude_longitude: user.latitude_longitude || "",
          position: user.position || "",
          nurse_id: user.nurse_id || "",
          alcohol_check: user.alcohol_check || false,
          notes: user.notes || "",
          role: user.role,
          password: "",
          confirmPassword: "",
        });
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          first_name_kana: "",
          last_name_kana: "",
          email: "",
          phone_number: "",
          postal_code: "",
          address_prefecture: "",
          address_city: "",
          address_building: "",
          latitude_longitude: "",
          position: "",
          nurse_id: "",
          alcohol_check: false,
          notes: "",
          role: "admin",
          password: "",
          confirmPassword: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, user, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "create") {
      // Basic validation
      if (!formData.email) {
        setErrors({ email: "メールアドレスは必須です" });
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setErrors({ password: "パスワードは6文字以上である必要があります" });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: "パスワードが一致しません" });
        return;
      }

      setIsSubmitting(true);
      try {
        const { confirmPassword, ...formDataWithoutConfirm } = formData;
        const payload: any = {
          ...formDataWithoutConfirm,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          first_name_kana: formData.first_name_kana || null,
          last_name_kana: formData.last_name_kana || null,
          phone_number: formData.phone_number || null,
          postal_code: formData.postal_code || null,
          address_prefecture: formData.address_prefecture || null,
          address_city: formData.address_city || null,
          address_building: formData.address_building || null,
          latitude_longitude: formData.latitude_longitude || null,
          position: formData.position || null,
          nurse_id: formData.nurse_id || null,
          alcohol_check: formData.alcohol_check,
          notes: formData.notes || null,
        };
        await onSubmit(payload);
        onClose();
      } catch (error: any) {
        if (error?.response?.data?.errors) {
          const validationErrors: Record<string, string> = {};
          error.response.data.errors.forEach((err: any) => {
            validationErrors[err.path] = err.message;
          });
          setErrors(validationErrors);
        } else {
          setErrors({ general: error?.response?.data?.message || "エラーが発生しました" });
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Edit mode - password is optional
      setIsSubmitting(true);
      try {
        const payload: any = {
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          first_name_kana: formData.first_name_kana || null,
          last_name_kana: formData.last_name_kana || null,
          email: formData.email || null,
          phone_number: formData.phone_number || null,
          postal_code: formData.postal_code || null,
          address_prefecture: formData.address_prefecture || null,
          address_city: formData.address_city || null,
          address_building: formData.address_building || null,
          latitude_longitude: formData.latitude_longitude || null,
          position: formData.position || null,
          nurse_id: formData.nurse_id || null,
          alcohol_check: formData.alcohol_check,
          notes: formData.notes || null,
          role: formData.role,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await onSubmit(payload as any);
        onClose();
      } catch (error: any) {
        if (error?.response?.data?.errors) {
          const validationErrors: Record<string, string> = {};
          error.response.data.errors.forEach((err: any) => {
            validationErrors[err.path] = err.message;
          });
          setErrors(validationErrors);
        } else {
          setErrors({ general: error?.response?.data?.message || "エラーが発生しました" });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "新規ユーザー登録" : "ユーザー編集"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {errors.general && (
            <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">エラー:</span>
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    姓 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                      errors.last_name
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    placeholder="山田"
                  />
                  {errors.last_name && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                      errors.first_name
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    placeholder="太郎"
                  />
                  {errors.first_name && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.first_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">連絡先情報</h3>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      姓（カナ）
                    </label>
                    <input
                      type="text"
                      value={formData.last_name_kana}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name_kana: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      placeholder="ヤマダ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      名（カナ）
                    </label>
                    <input
                      type="text"
                      value={formData.first_name_kana}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name_kana: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      placeholder="タロウ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                      errors.phone_number
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    placeholder="090-1234-5678"
                  />
                  {errors.phone_number && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.phone_number}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">住所情報</h3>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    placeholder="123-4567"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      都道府県
                    </label>
                    <input
                      type="text"
                      value={formData.address_prefecture}
                      onChange={(e) =>
                        setFormData({ ...formData, address_prefecture: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      placeholder="東京都"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      市区町村
                    </label>
                    <input
                      type="text"
                      value={formData.address_city}
                      onChange={(e) =>
                        setFormData({ ...formData, address_city: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      placeholder="渋谷区"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    建物名・番地
                  </label>
                  <input
                    type="text"
                    value={formData.address_building}
                    onChange={(e) =>
                      setFormData({ ...formData, address_building: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="1-2-3 ビル名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    座標（緯度,経度）
                  </label>
                  <input
                    type="text"
                    value={formData.latitude_longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude_longitude: e.target.value })
                    }
                    placeholder="35.6895,139.6917"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">職務情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    ロール <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as User["role"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="admin">管理者</option>
                    <option value="nurse">看護師</option>
                    <option value="facility_manager">施設管理者</option>
                    <option value="corporate_officer">法人担当者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    役職
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="主任看護師"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    看護師ID
                  </label>
                  <input
                    type="text"
                    value={formData.nurse_id}
                    onChange={(e) =>
                      setFormData({ ...formData, nurse_id: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="100001"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-white">
                  <input
                    type="checkbox"
                    id="alcohol_check"
                    checked={formData.alcohol_check}
                    onChange={(e) =>
                      setFormData({ ...formData, alcohol_check: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="alcohol_check" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    アルコールチェック必須
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    備考
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                    placeholder="備考を入力してください"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">パスワード設定</h3>
              {mode === "create" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      パスワード <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                      placeholder="6文字以上"
                    />
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      パスワード確認 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                        errors.confirmPassword
                          ? "border-red-500 bg-red-50"
                          : "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                      placeholder="パスワードを再入力"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    新しいパスワード（変更する場合のみ）
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="変更しない場合は空欄のまま"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer with actions */}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "保存中..."
                : mode === "create"
                ? "登録"
                : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

