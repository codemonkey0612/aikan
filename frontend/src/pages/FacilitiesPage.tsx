import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFacilities } from "../hooks/useFacilities";
import { Card } from "../components/ui/Card";
import { BuildingOffice2Icon, MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";

export function FacilitiesPage() {
  const navigate = useNavigate();
  const { data: facilities, isLoading } = useFacilities();
  const [query, setQuery] = useState("");

  const filteredFacilities = useMemo(() => {
    if (!facilities) return [];
    
    if (!query.trim()) return facilities;

      const keyword = query.trim().toLowerCase();
    return facilities.filter((facility) => {
        const address = [
          facility.address_prefecture,
          facility.address_city,
          facility.address_building,
        ].filter(Boolean).join("");
        const haystack = `${facility.name ?? ""}${address}${
          facility.facility_number ?? ""
        }`.toLowerCase();
        return haystack.includes(keyword);
      });
  }, [facilities, query]);

  const handleFacilityClick = (facilityId: string) => {
    navigate(`/facilities/${facilityId}`);
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
          施設リスト
        </h1>
        <p className="text-slate-500">
          施設の詳細情報を確認できます。
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
              placeholder="施設名、住所、コードで検索..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
        </div>
      </Card>

      {/* Facility List */}
      <Card>
        <div className="space-y-2">
          {filteredFacilities.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>条件に一致する施設が見つかりませんでした。</p>
            </div>
          ) : (
            filteredFacilities.map((facility) => {
              const address = [
                facility.address_prefecture,
                facility.address_city,
                facility.address_building,
              ].filter(Boolean).join(" ");
              
              return (
                <div
                  key={facility.facility_id}
                  onClick={() => handleFacilityClick(facility.facility_id)}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex-shrink-0">
                    <BuildingOffice2Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 transition">
                      {facility.name || "名称未設定"}
                    </h3>
                    {address && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{address}</span>
                      </div>
                    )}
                    {facility.facility_number && (
                      <p className="text-xs text-slate-400 mt-1">
                        コード: {facility.facility_number}
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
