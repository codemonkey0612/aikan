import { useState, useMemo } from "react";
import { useAlcoholChecks } from "../hooks/useAlcoholChecks";
import { AlcoholCheckCard } from "../components/alcohol-check/AlcoholCheckCard";
import { AlcoholCheckDetailHeader } from "../components/alcohol-check/AlcoholCheckDetailHeader";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { AlcoholCheck } from "../api/types";

export function AlcoholCheckPage() {
  const { data: checks, isLoading } = useAlcoholChecks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCheck, setSelectedCheck] = useState<AlcoholCheck | null>(null);

  // 検索フィルタリング
  const filteredChecks = useMemo(() => {
    if (!checks) return [];
    if (!searchQuery) return checks;

    const query = searchQuery.toLowerCase();
    return checks.filter((check) => {
      const userName = `${check.user_first_name || ""} ${check.user_last_name || ""}`.toLowerCase();
      const residentName = `${check.resident_first_name || ""} ${check.resident_last_name || ""}`.toLowerCase();
      return (
        userName.includes(query) ||
        residentName.includes(query) ||
        check.user_email?.toLowerCase().includes(query) ||
        check.breath_alcohol_concentration.toString().includes(query)
      );
    });
  }, [checks, searchQuery]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).toUpperCase();
  };

  const getUserName = (check: AlcoholCheck) => {
    if (check.user_first_name && check.user_last_name) {
      return `${check.user_last_name} ${check.user_first_name}`;
    }
    if (check.user_first_name) return check.user_first_name;
    if (check.user_last_name) return check.user_last_name;
    return check.user_email || `ユーザー #${check.user_id}`;
  };

  const getResidentName = (check: AlcoholCheck) => {
    if (check.resident_first_name && check.resident_last_name) {
      return `${check.resident_last_name} ${check.resident_first_name}`;
    }
    if (check.resident_first_name) return check.resident_first_name;
    if (check.resident_last_name) return check.resident_last_name;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">アルコールチェックを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            安全管理
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">アルコールチェック</h1>
        </div>
        <div className="relative w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </header>

      {/* グリッド表示 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredChecks.map((check) => (
          <AlcoholCheckCard
            key={check.id}
            check={check}
            onClick={() => setSelectedCheck(check)}
            getUserName={getUserName}
            formatDateTime={formatDateTime}
          />
        ))}
      </div>

      {filteredChecks.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">
            {searchQuery ? "検索結果が見つかりませんでした" : "アルコールチェックがまだ登録されていません"}
          </p>
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">詳細</h2>
              <button
                onClick={() => setSelectedCheck(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6">
              {/* 日時とユーザー情報 */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlcoholCheckDetailHeader
                    check={selectedCheck}
                    getUserName={getUserName}
                    formatDateTime={formatDateTime}
                  />
                </div>
                <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
                  変更
                </button>
              </div>

              {/* デバイス画像 */}
              <div className="mb-6 flex items-center justify-center rounded-lg bg-slate-50 p-8">
                {selectedCheck.device_image_path ? (
                  <img
                    src={selectedCheck.device_image_path}
                    alt="アルコールチェックデバイス"
                    className="max-h-64 object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <div className="text-4xl font-bold">0.0</div>
                    <div className="text-sm">g/L</div>
                    <div className="text-sm">0.00 %BAC</div>
                  </div>
                )}
              </div>

              {/* 詳細情報フォーム */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    呼気アルコール濃度
                  </label>
                  <input
                    type="number"
                    value={selectedCheck.breath_alcohol_concentration}
                    readOnly
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    日時
                  </label>
                  <input
                    type="datetime-local"
                    value={new Date(selectedCheck.checked_at).toISOString().slice(0, 16)}
                    readOnly
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                {selectedCheck.resident_id && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      入居者
                    </label>
                    <input
                      type="text"
                      value={getResidentName(selectedCheck) || `入居者 #${selectedCheck.resident_id}`}
                      readOnly
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {selectedCheck.notes && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      備考
                    </label>
                    <textarea
                      value={selectedCheck.notes}
                      readOnly
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

