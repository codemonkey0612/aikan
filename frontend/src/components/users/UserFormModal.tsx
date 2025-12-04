import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { User } from "../../api/types";
import { registerSchema } from "../../validations/auth.validation";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "新規ユーザー登録" : "ユーザー編集"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  姓
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                    errors.last_name
                      ? "border-rose-500"
                      : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  }`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  名
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                    errors.first_name
                      ? "border-rose-500"
                      : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  }`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.first_name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                  errors.email
                    ? "border-rose-500"
                    : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  姓（カナ）
                </label>
                <input
                  type="text"
                  value={formData.last_name_kana}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name_kana: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  名（カナ）
                </label>
                <input
                  type="text"
                  value={formData.first_name_kana}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name_kana: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                電話番号
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                  errors.phone_number
                    ? "border-rose-500"
                    : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                }`}
              />
              {errors.phone_number && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                郵便番号
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                placeholder="123-4567"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                都道府県
              </label>
              <input
                type="text"
                value={formData.address_prefecture}
                onChange={(e) =>
                  setFormData({ ...formData, address_prefecture: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                市区町村
              </label>
              <input
                type="text"
                value={formData.address_city}
                onChange={(e) =>
                  setFormData({ ...formData, address_city: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                建物名・番地
              </label>
              <input
                type="text"
                value={formData.address_building}
                onChange={(e) =>
                  setFormData({ ...formData, address_building: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                座標（緯度,経度）
              </label>
              <input
                type="text"
                value={formData.latitude_longitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude_longitude: e.target.value })
                }
                placeholder="35.6895,139.6917"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                役職
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                看護師ID
              </label>
              <input
                type="text"
                value={formData.nurse_id}
                onChange={(e) =>
                  setFormData({ ...formData, nurse_id: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="alcohol_check"
                checked={formData.alcohol_check}
                onChange={(e) =>
                  setFormData({ ...formData, alcohol_check: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="alcohol_check" className="text-sm font-medium text-slate-700">
                アルコールチェック必須
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                備考
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                ロール <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as User["role"],
                  })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="admin">管理者</option>
                <option value="nurse">看護師</option>
                <option value="facility_manager">施設管理者</option>
                <option value="corporate_officer">法人担当者</option>
              </select>
            </div>

            {mode === "create" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    パスワード <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                      errors.password
                        ? "border-rose-500"
                        : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    パスワード確認 <span className="text-rose-500">*</span>
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
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                      errors.confirmPassword
                        ? "border-rose-500"
                        : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            {mode === "edit" && (
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  新しいパスワード（変更する場合のみ）
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
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

