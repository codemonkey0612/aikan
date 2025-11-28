import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile, useChangePassword } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import { useAvatar } from "../hooks/useAvatar";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { FileUpload } from "../components/files/FileUpload";
import { FileList } from "../components/files/FileList";

export function ProfilePage() {
  const { refreshProfile } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: avatarUrl, refetch: refetchAvatar } = useAvatar(profile?.id);
  const queryClient = useQueryClient();
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const getUserDisplayName = () => {
    if (!profile) return "ユーザー";
    if (profile.first_name && profile.last_name) {
      return `${profile.last_name} ${profile.first_name}`;
    }
    if (profile.first_name) return profile.first_name;
    if (profile.last_name) return profile.last_name;
    return profile.email || "ユーザー";
  };

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
          {/* アバター表示（クリック可能） */}
          {profile && (
            <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-6">
              <label
                htmlFor="avatar-upload-input"
                className={`relative cursor-pointer group ${isUploadingAvatar ? "opacity-50 cursor-wait" : ""}`}
                title="クリックしてアバターを変更"
              >
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingAvatar}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // ファイルサイズチェック（10MB）
                    if (file.size > 10 * 1024 * 1024) {
                      alert("ファイルサイズが大きすぎます。最大10MBまでです。");
                      e.target.value = "";
                      return;
                    }

                    // ファイルタイプチェック
                    if (!file.type.startsWith("image/")) {
                      alert("画像ファイルを選択してください。");
                      e.target.value = "";
                      return;
                    }

                    setIsUploadingAvatar(true);
                    try {
                      const { FilesAPI } = await import("../api/endpoints");
                      await FilesAPI.upload(file, "PROFILE_AVATAR", "user", profile.id);

                      // アバターを再取得
                      await queryClient.invalidateQueries({
                        queryKey: ["avatar", profile.id],
                      });
                      await queryClient.invalidateQueries({
                        queryKey: ["files", "entity", "user", profile.id],
                      });
                      await refetchAvatar();
                      
                      setSuccessMessage("アバターを更新しました");
                      setTimeout(() => setSuccessMessage(""), 3000);
                    } catch (error: any) {
                      console.error("Avatar upload error:", error);
                      const errorMessage = error?.response?.data?.message || error?.message || "アバターのアップロードに失敗しました";
                      alert(errorMessage);
                      setErrors({ general: errorMessage });
                    } finally {
                      setIsUploadingAvatar(false);
                      // 入力フィールドをリセット
                      e.target.value = "";
                    }
                  }}
                />
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={getUserDisplayName()}
                      className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 transition group-hover:opacity-80"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-2xl border-2 border-slate-200 transition group-hover:opacity-80 ${
                      avatarUrl ? "hidden" : ""
                    }`}
                  >
                    {profile?.first_name && profile?.last_name
                      ? `${profile.last_name.charAt(0)}${profile.first_name.charAt(0)}`.toUpperCase()
                      : profile?.email
                      ? profile.email.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  {/* ホバー時のオーバーレイ */}
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition">
                      {isUploadingAvatar ? "アップロード中..." : "変更"}
                    </span>
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </label>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
                <p className="mt-1 text-xs text-slate-400">アバターをクリックして変更</p>
              </div>
            </div>
          )}

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

      {/* プロフィール画像 */}
      {profile && (
        <Card title="プロフィール画像の変更">
          <div className="space-y-4">
            <FileUpload
              category="PROFILE_AVATAR"
              entity_type="user"
              entity_id={profile.id}
              accept="image/*"
              onUploadSuccess={() => {
                // アバターを再取得するためにクエリを無効化
                window.location.reload();
              }}
            />
            <FileList
              category="PROFILE_AVATAR"
              entity_type="user"
              entity_id={profile.id}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

