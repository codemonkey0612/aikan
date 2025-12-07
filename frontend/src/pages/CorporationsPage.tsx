import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCorporations } from "../hooks/useCorporations";
import { Card } from "../components/ui/Card";
import { BriefcaseIcon, MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";

export function CorporationsPage() {
  const navigate = useNavigate();
  const { data: corporations, isLoading } = useCorporations();
  const [query, setQuery] = useState("");

  const filteredCorporations = useMemo(() => {
    if (!corporations) return [];
    
    if (!query.trim()) return corporations;
    
    const keyword = query.trim().toLowerCase();
    return corporations.filter((corporation) => {
      const address = [
        corporation.address_prefecture,
        corporation.address_city,
        corporation.address_building,
      ].filter(Boolean).join("");
      const haystack = `${corporation.name ?? ""}${corporation.name_kana ?? ""}${address}${
        corporation.corporation_number ?? ""
      }`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [corporations, query]);

  const handleCorporationClick = (corporationId: string) => {
    navigate(`/corporations/${corporationId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          ネットワーク
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          法人リスト
        </h1>
        <p className="text-slate-500">
          法人の詳細情報を確認できます。
        </p>
      </header>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-3">
          <label className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="法人名、住所、法人番号で検索..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>
      </Card>

      {/* Corporation List */}
      <Card>
        <div className="space-y-2">
          {filteredCorporations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>条件に一致する法人が見つかりませんでした。</p>
            </div>
          ) : (
            filteredCorporations.map((corporation) => {
              const address = [
                corporation.address_prefecture,
                corporation.address_city,
                corporation.address_building,
              ].filter(Boolean).join(" ");

              return (
                <div
                  key={corporation.corporation_id}
                  onClick={() => handleCorporationClick(corporation.corporation_id)}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white flex-shrink-0">
                    <BriefcaseIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 transition">
                      {corporation.name || "名称未設定"}
                    </h3>
                    {corporation.name_kana && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {corporation.name_kana}
                      </p>
                    )}
                    {address && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{address}</span>
                      </div>
                    )}
                    {corporation.corporation_number && (
                      <p className="text-xs text-slate-400 mt-1">
                        法人番号: {corporation.corporation_number}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 group-hover:text-brand-600 transition">
                    →
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
