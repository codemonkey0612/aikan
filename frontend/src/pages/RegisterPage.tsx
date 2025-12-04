import { type FormEvent, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../api/types";
import { registerSchema } from "../validations/auth.validation";

export function RegisterPage() {
  const { user, register, loading, error } = useAuth();
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: User["role"];
    password: string;
    confirmPassword: string;
  }>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "admin",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setValidationErrors({});

    // Zodバリデーション
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = result.data;
      await register(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            ナーシングシステム
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            管理者登録
          </h1>
          <p className="text-sm text-slate-500">
            最初の管理者アカウントを作成してください。
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-slate-700">
              姓
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => {
                  setFormData({ ...formData, last_name: e.target.value });
                  if (validationErrors.last_name) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.last_name;
                      return next;
                    });
                  }
                }}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                  validationErrors.last_name ? "border-rose-500" : "border-slate-200"
                }`}
                placeholder="姓"
              />
              {validationErrors.last_name && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.last_name}</p>
              )}
            </label>
            <label className="block text-sm font-medium text-slate-700">
            名
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => {
                  setFormData({ ...formData, first_name: e.target.value });
                  if (validationErrors.first_name) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.first_name;
                      return next;
                    });
                  }
                }}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                  validationErrors.first_name ? "border-rose-500" : "border-slate-200"
                }`}
                placeholder="名"
              />
              {validationErrors.first_name && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.first_name}</p>
              )}
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            メールアドレス
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (validationErrors.email) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }
              }}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                validationErrors.email ? "border-rose-500" : "border-slate-200"
              }`}
              placeholder="nurse@gmail.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.email}</p>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            電話番号
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (validationErrors.phone) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                }
              }}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                validationErrors.phone ? "border-rose-500" : "border-slate-200"
              }`}
              placeholder="090-0000-0000"
            />
            {validationErrors.phone && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.phone}</p>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            役割
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as User["role"] })
              }
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            >
              <option value="admin">管理者</option>
              <option value="facility_manager">施設管理者</option>
              <option value="nurse">看護師</option>
              <option value="corporate_officer">法人担当者</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            パスワード
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (validationErrors.password) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.password;
                    return next;
                  });
                }
              }}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                validationErrors.password ? "border-rose-500" : "border-slate-200"
              }`}
              placeholder="********"
            />
            {validationErrors.password && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.password}</p>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            パスワード（確認）
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (validationErrors.confirmPassword) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.confirmPassword;
                    return next;
                  });
                }
              }}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                validationErrors.confirmPassword ? "border-rose-500" : "border-slate-200"
              }`}
              placeholder="********"
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.confirmPassword}</p>
            )}
          </label>

          {(error || loading) && (
            <p className="text-sm text-rose-600">
              {error ?? "登録中..."}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {submitting ? "登録中..." : "登録"}
          </button>

          <p className="text-center text-sm text-slate-500">
            既にアカウントをお持ちですか？{" "}
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

