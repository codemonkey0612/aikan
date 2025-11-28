import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../validations/auth.validation";

export function LoginPage() {
  const { user, login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setValidationErrors({});

    // Zodバリデーション
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
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
            サインイン
          </h1>
          <p className="text-sm text-slate-500">
            登録済みのメールアドレスとパスワードを入力してください。
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            メールアドレス
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
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
              placeholder="nurse@example.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.email}</p>
            )}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            パスワード
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
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

          {(error || loading) && (
            <p className="text-sm text-rose-600">
              {error ?? "認証状態を確認しています..."}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {submitting ? "送信中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

