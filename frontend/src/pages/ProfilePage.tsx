import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile, useChangePassword } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/Card";
import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export function ProfilePage() {
  const { refreshProfile } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  // プロフィールデータをフォームに設定
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      await updateProfileMutation.mutateAsync({
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
      });
      setSuccessMessage("プロフィールを更新しました");
      await refreshProfile();
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error?.response?.data?.message || "プロフィールの更新に失敗しました" });
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrors({ confirm_password: "新しいパスワードと確認パスワードが一致しません" });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });
      setSuccessMessage("パスワードを変更しました");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error?.response?.data?.message || "パスワードの変更に失敗しました" });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          アカウント設定
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">プロフィール</h1>
      </header>

      {/* タブ */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === "profile"
              ? "border-b-2 border-brand-600 text-brand-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCircleIcon className="h-5 w-5" />
          プロフィール
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === "password"
              ? "border-b-2 border-brand-600 text-brand-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LockClosedIcon className="h-5 w-5" />
          パスワード変更
        </button>
      </div>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {/* エラーメッセージ */}
      {errors.general && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {errors.general}
        </div>
      )}

      {/* プロフィール編集タブ */}
      {activeTab === "profile" && (
        <Card title="プロフィール情報">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="姓"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-rose-600">{errors.last_name}</p>
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
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="名"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-rose-600">{errors.first_name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                メールアドレス
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-rose-600">{errors.email}</p>
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
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="090-1234-5678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-rose-600">{errors.phone}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">ロール:</span>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                {profile?.role}
              </span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
              >
                {updateProfileMutation.isPending ? "更新中..." : "プロフィールを更新"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* パスワード変更タブ */}
      {activeTab === "password" && (
        <Card title="パスワード変更">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                現在のパスワード
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    current_password: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
              {errors.current_password && (
                <p className="mt-1 text-sm text-rose-600">
                  {errors.current_password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                新しいパスワード
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new_password: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
                minLength={6}
              />
              {errors.new_password && (
                <p className="mt-1 text-sm text-rose-600">
                  {errors.new_password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirm_password: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
                minLength={6}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-rose-600">
                  {errors.confirm_password}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
              >
                {changePasswordMutation.isPending
                  ? "変更中..."
                  : "パスワードを変更"}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

