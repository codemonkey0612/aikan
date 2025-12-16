import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFacilities, useCreateFacility } from "../hooks/useFacilities";
import { FacilityFormModal } from "../components/facilities/FacilityFormModal";
import { Card } from "../components/ui/Card";
import { BuildingOffice2Icon, MagnifyingGlassIcon, MapPinIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Pagination } from "../components/ui/Pagination";
import toast from "react-hot-toast";
import type { Facility } from "../api/types";

const ITEMS_PER_PAGE = 20;

export function FacilitiesPage() {
  const navigate = useNavigate();
  const { data: facilities, isLoading } = useFacilities();
  const createFacilityMutation = useCreateFacility();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    setPage(1);
  }, [query]);

  const paginatedFacilities = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredFacilities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFacilities, page]);

  const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE) || 1;

  const handleFacilityClick = (facilityId: string) => {
    navigate(`/facilities/${facilityId}`);
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    try {
      await createFacilityMutation.mutateAsync(data);
      toast.success("施設を作成しました");
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "施設の作成に失敗しました");
      throw error;
    }
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
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            ネットワーク
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            施設リスト
          </h1>
          <p className="text-slate-500">
            施設の詳細情報を確認できます。
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          新規作成
        </button>
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
            paginatedFacilities.map((facility) => {
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
          {filteredFacilities.length > 0 && totalPages > 1 && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
              <p className="mt-2 text-center text-sm text-slate-500">
                {filteredFacilities.length} 件中{" "}
                {((page - 1) * ITEMS_PER_PAGE + 1)}-
                {Math.min(page * ITEMS_PER_PAGE, filteredFacilities.length)} 件を表示
              </p>
            </div>
          )}
          </div>
      </Card>

      {/* Facility Form Modal */}
      <FacilityFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
}
