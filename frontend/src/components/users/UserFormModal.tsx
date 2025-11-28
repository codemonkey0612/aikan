import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { User } from "../../api/types";
import { registerSchema } from "../../validations/auth.validation";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    role: User["role"];
    password: string;
  }) => Promise<void>;
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
    email: "",
    phone: "",
    role: "ADMIN" as User["role"],
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
          email: user.email || "",
          phone: user.phone || "",
          role: user.role,
          password: "",
          confirmPassword: "",
        });
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          role: "ADMIN",
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
      const result = registerSchema.safeParse(formData);
      if (!result.success) {
        const validationErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          validationErrors[path] = issue.message;
        });
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        const { confirmPassword, ...payload } = result.data;
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
          email: formData.email || null,
          phone: formData.phone || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
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

            <div>
              <label className="block text-sm font-medium text-slate-700">
                電話番号
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                  errors.phone
                    ? "border-rose-500"
                    : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
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
                <option value="ADMIN">ADMIN</option>
                <option value="NURSE">NURSE</option>
                <option value="STAFF">STAFF</option>
                <option value="FACILITY_MANAGER">FACILITY_MANAGER</option>
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

