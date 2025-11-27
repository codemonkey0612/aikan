import { type FormEvent, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const { user, register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "ADMIN" as const,
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = formData;
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
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="姓"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
            名
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="名"
                required
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            メールアドレス
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="nurse@gmail.com"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            電話番号
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="090-0000-0000"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            パスワード
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="********"
              required
              minLength={6}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            パスワード（確認）
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="********"
              required
              minLength={6}
            />
          </label>

          {formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p className="text-sm text-rose-600">
                パスワードが一致しません
              </p>
            )}

          {(error || loading) && (
            <p className="text-sm text-rose-600">
              {error ?? "登録中..."}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || formData.password !== formData.confirmPassword}
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

