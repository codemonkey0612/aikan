import { useMemo, useState } from "react";
import { useFacilities, useCreateFacility, useUpdateFacility, useDeleteFacility } from "../hooks/useFacilities";
import { useCorporations } from "../hooks/useCorporations";
import { useAuth } from "../hooks/useAuth";
import { FacilityFormModal } from "../components/facilities/FacilityFormModal";
import { Card } from "../components/ui/Card";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { Pagination } from "../components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import {
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Facility } from "../api/types";

const ITEMS_PER_PAGE = 20;

export function FacilitiesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useFacilities();
  const { data: corporations } = useCorporations();
  const createFacilityMutation = useCreateFacility();
  const updateFacilityMutation = useUpdateFacility();
  const deleteFacilityMutation = useDeleteFacility();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [addressFilter, setAddressFilter] = useState<"all" | "with" | "without">("all");
  const [geoFilter, setGeoFilter] = useState<"all" | "with" | "without">("all");
  const [corporationFilter, setCorporationFilter] = useState<string>("all");

  const stats = useMemo(() => {
    if (!data?.length) {
      return [
        { title: "登録施設数", value: 0, change: "-" },
        { title: "住所登録率", value: "0%", change: "0件" },
        { title: "緯度経度設定", value: "0%", change: "0件" },
        { title: "コード登録数", value: 0, change: "-" },
      ];
    }
    const total = data.length;
    const addressCount = data.filter((f) => 
      !!(f.address_prefecture || f.address_city || f.address_building)
    ).length;
    const geoCount = data.filter((f) => !!f.latitude_longitude).length;
    const codeCount = data.filter((f) => !!f.facility_number).length;
    const rate = (count: number) =>
      `${Math.round((count / total) * 100) || 0}%`;

    return [
      { title: "登録施設数", value: total, change: "全体" },
      { title: "住所登録率", value: rate(addressCount), change: `${addressCount} / ${total}` },
      { title: "緯度経度設定", value: rate(geoCount), change: `${geoCount} / ${total}` },
      { title: "コード登録数", value: codeCount, change: "-" },
    ];
  }, [data]);

  const filteredFacilities = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;

    // 検索クエリでフィルタリング
    if (query.trim()) {
      const keyword = query.trim().toLowerCase();
      filtered = filtered.filter((facility) => {
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
    }

    // 住所フィルター
    if (addressFilter === "with") {
      filtered = filtered.filter((f) => 
        !!(f.address_prefecture || f.address_city || f.address_building)
      );
    } else if (addressFilter === "without") {
      filtered = filtered.filter((f) => 
        !(f.address_prefecture || f.address_city || f.address_building)
      );
    }

    // 緯度経度フィルター
    if (geoFilter === "with") {
      filtered = filtered.filter((f) => !!f.latitude_longitude);
    } else if (geoFilter === "without") {
      filtered = filtered.filter((f) => !f.latitude_longitude);
    }

    // 法人フィルター
    if (corporationFilter !== "all") {
      filtered = filtered.filter((f) => f.corporation_id === corporationFilter);
    }

    return filtered;
  }, [data, query, addressFilter, geoFilter, corporationFilter]);

  // ページネーション計算
  const paginatedFacilities = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredFacilities.slice(startIndex, endIndex);
  }, [filteredFacilities, page]);

  const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE);

  // 検索クエリが変更されたらページを1にリセット
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleCreateFacility = async (data: any) => {
    await createFacilityMutation.mutateAsync(data);
  };

  const handleUpdateFacility = async (data: any) => {
    if (editingFacility) {
      await updateFacilityMutation.mutateAsync({ id: editingFacility.facility_id, data });
    }
  };

  const handleDeleteFacility = async (facility: Facility) => {
    if (window.confirm(`${facility.name} を削除してもよろしいですか？`)) {
      await deleteFacilityMutation.mutateAsync(facility.facility_id);
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
  };

  const canWrite = user?.role === "admin" || user?.role === "facility_manager";

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
          施設の所在地やコード、地図登録状況を一目で把握できます。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <SummaryCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={<BuildingOffice2Icon className="h-6 w-6" />}
          />
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              施設検索
            </h2>
            <p className="text-sm text-slate-500">
              名称・住所・コードで絞り込みができます。
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 検索バー */}
            <label className="relative w-full lg:w-80">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="例：銀河ケアセンター"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>

            {/* フィルターボタン */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FunnelIcon className="h-4 w-4" />
                フィルター
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 z-10 mt-2 w-64 rounded-md border border-slate-200 bg-white shadow-lg">
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        住所
                      </label>
                      <select
                        value={addressFilter}
                        onChange={(e) => {
                          setAddressFilter(e.target.value as "all" | "with" | "without");
                          setPage(1);
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        <option value="all">すべて</option>
                        <option value="with">住所あり</option>
                        <option value="without">住所なし</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        緯度経度
                      </label>
                      <select
                        value={geoFilter}
                        onChange={(e) => {
                          setGeoFilter(e.target.value as "all" | "with" | "without");
                          setPage(1);
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        <option value="all">すべて</option>
                        <option value="with">設定あり</option>
                        <option value="without">設定なし</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        法人
                      </label>
                      <select
                        value={corporationFilter}
                        onChange={(e) => {
                          setCorporationFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        <option value="all">すべて</option>
                        {corporations?.map((corp) => (
                          <option key={corp.corporation_id} value={corp.corporation_id}>
                            {corp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 新規作成ボタン */}
            {canWrite && (
              <button
                onClick={() => {
                  setEditingFacility(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
              >
                <PlusIcon className="h-4 w-4" />
                新規作成
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {paginatedFacilities.map((facility) => {
            const address = [
              facility.address_prefecture,
              facility.address_city,
              facility.address_building,
            ].filter(Boolean).join(" ");
            const [lat, lng] = facility.latitude_longitude
              ? facility.latitude_longitude.split(",").map((s) => s.trim())
              : [null, null];
            
            return (
              <div
                key={facility.facility_id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      施設名
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {facility.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      コード: {facility.facility_number ?? "―"}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                    #{facility.facility_id}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="mt-0.5 h-4 w-4 text-brand-500" />
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">
                        住所
                      </dt>
                      <dd>{address || "未設定"}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ClipboardDocumentListIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">
                        緯度 / 経度
                      </dt>
                      <dd>
                        {lat && lng
                          ? `${lat}, ${lng}`
                          : "未登録"}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        {!isLoading && !filteredFacilities.length && (
          <p className="mt-6 text-center text-sm text-slate-400">
            条件に一致する施設が見つかりませんでした。
          </p>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
            <p className="mt-4 text-center text-sm text-slate-500">
              {filteredFacilities.length}件中 {((page - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(page * ITEMS_PER_PAGE, filteredFacilities.length)}件を表示
            </p>
          </div>
        )}
      </Card>

      <Card title="全施設一覧">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>名称</TableHeaderCell>
              <TableHeaderCell>住所</TableHeaderCell>
              <TableHeaderCell>コード</TableHeaderCell>
              {canWrite && <TableHeaderCell>操作</TableHeaderCell>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={canWrite ? 4 : 3} className="text-center text-slate-400">
                  施設を読み込み中...
                </TableCell>
              </TableRow>
            )}
            {paginatedFacilities.map((facility) => {
              const address = [
                facility.address_prefecture,
                facility.address_city,
                facility.address_building,
              ].filter(Boolean).join(" ");
              
              return (
                <TableRow key={facility.facility_id}>
                  <TableCell>{facility.name}</TableCell>
                  <TableCell>{address || "未登録"}</TableCell>
                  <TableCell>{facility.facility_number ?? "―"}</TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditFacility(facility)}
                          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
                          title="編集"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFacility(facility)}
                          className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                          title="削除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {!isLoading && !filteredFacilities.length && (
              <TableRow>
                <TableCell colSpan={canWrite ? 4 : 3} className="text-center text-slate-400">
                  施設がまだ登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
            <p className="mt-2 text-center text-sm text-slate-500">
              {filteredFacilities.length}件中 {((page - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(page * ITEMS_PER_PAGE, filteredFacilities.length)}件を表示
            </p>
          </div>
        )}
      </Card>

      {/* フォームモーダル */}
      <FacilityFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingFacility ? handleUpdateFacility : handleCreateFacility}
        facility={editingFacility}
        mode={editingFacility ? "edit" : "create"}
      />
    </div>
  );
}

