import { type FormEvent, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../validations/auth.validation";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

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
      toast.success("ログインに成功しました");
    } catch (err: any) {
      toast.error(err?.message || "ログインに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-lg">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            サインイン
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            登録済みのメールアドレスとパスワードを入力してください
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                メールアドレス
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon
                    className={`h-5 w-5 ${
                      validationErrors.email ? "text-rose-500" : "text-slate-400"
                    }`}
                  />
                </div>
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
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition focus:outline-none focus:ring-2 ${
                    validationErrors.email
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/20"
                  }`}
                  placeholder="nurse@example.com"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                パスワード
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon
                    className={`h-5 w-5 ${
                      validationErrors.password ? "text-rose-500" : "text-slate-400"
                    }`}
                  />
                </div>
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
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition focus:outline-none focus:ring-2 ${
                    validationErrors.password
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/20"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {validationErrors.password && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && !loading && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-sm font-medium text-rose-800">{error}</p>
              </div>
            )}

            {/* Loading Message */}
            {loading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-800">
                  認証状態を確認しています...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || loading}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    送信中...
                  </>
                ) : (
                  <>
                    ログイン
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              アカウントをお持ちでないですか？{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
              >
                新規登録
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          © 2025 ナーシングシステム. All rights reserved.
        </p>
      </div>
    </div>
  );
}

