import { useMemo, useState } from "react";
import { useCorporations, useCreateCorporation, useUpdateCorporation, useDeleteCorporation } from "../hooks/useCorporations";
import { useAuth } from "../hooks/useAuth";
import { CorporationFormModal } from "../components/corporations/CorporationFormModal";
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
import type { Corporation } from "../api/types";

const ITEMS_PER_PAGE = 20;

export function CorporationsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useCorporations();
  const createCorporationMutation = useCreateCorporation();
  const updateCorporationMutation = useUpdateCorporation();
  const deleteCorporationMutation = useDeleteCorporation();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCorporation, setEditingCorporation] = useState<Corporation | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [addressFilter, setAddressFilter] = useState<"all" | "with" | "without">("all");
  const [geoFilter, setGeoFilter] = useState<"all" | "with" | "without">("all");

  const stats = useMemo(() => {
    if (!data?.length) {
      return [
        { title: "登録法人数", value: 0, change: "-" },
        { title: "住所登録率", value: "0%", change: "0件" },
        { title: "緯度経度設定", value: "0%", change: "0件" },
        { title: "法人番号登録数", value: 0, change: "-" },
      ];
    }
    const total = data.length;
    const addressCount = data.filter((c) => 
      !!(c.address_prefecture || c.address_city || c.address_building)
    ).length;
    const geoCount = data.filter((c) => !!c.latitude_longitude).length;
    const numberCount = data.filter((c) => !!c.corporation_number).length;
    const rate = (count: number) =>
      `${Math.round((count / total) * 100) || 0}%`;

    return [
      { title: "登録法人数", value: total, change: "全体" },
      { title: "住所登録率", value: rate(addressCount), change: `${addressCount} / ${total}` },
      { title: "緯度経度設定", value: rate(geoCount), change: `${geoCount} / ${total}` },
      { title: "法人番号登録数", value: numberCount, change: "-" },
    ];
  }, [data]);

  const filteredCorporations = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;

    // 検索クエリでフィルタリング
    if (query.trim()) {
      const keyword = query.trim().toLowerCase();
      filtered = filtered.filter((corporation) => {
        const address = [
          corporation.address_prefecture,
          corporation.address_city,
          corporation.address_building,
        ].filter(Boolean).join("");
        const haystack = `${corporation.name ?? ""}${address}${
          corporation.corporation_number ?? ""
        }`.toLowerCase();
        return haystack.includes(keyword);
      });
    }

    // 住所フィルター
    if (addressFilter === "with") {
      filtered = filtered.filter((c) => 
        !!(c.address_prefecture || c.address_city || c.address_building)
      );
    } else if (addressFilter === "without") {
      filtered = filtered.filter((c) => 
        !(c.address_prefecture || c.address_city || c.address_building)
      );
    }

    // 緯度経度フィルター
    if (geoFilter === "with") {
      filtered = filtered.filter((c) => !!c.latitude_longitude);
    } else if (geoFilter === "without") {
      filtered = filtered.filter((c) => !c.latitude_longitude);
    }

    return filtered;
  }, [data, query, addressFilter, geoFilter]);

  // ページネーション計算
  const paginatedCorporations = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCorporations.slice(startIndex, endIndex);
  }, [filteredCorporations, page]);

  const totalPages = Math.ceil(filteredCorporations.length / ITEMS_PER_PAGE);

  // 検索クエリが変更されたらページを1にリセット
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleCreateCorporation = async (data: any) => {
    await createCorporationMutation.mutateAsync(data);
  };

  const handleUpdateCorporation = async (data: any) => {
    if (editingCorporation) {
      await updateCorporationMutation.mutateAsync({ id: editingCorporation.corporation_id, data });
    }
  };

  const handleDeleteCorporation = async (corporation: Corporation) => {
    if (window.confirm(`${corporation.name} を削除してもよろしいですか？`)) {
      await deleteCorporationMutation.mutateAsync(corporation.corporation_id);
    }
  };

  const handleEditCorporation = (corporation: Corporation) => {
    setEditingCorporation(corporation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCorporation(null);
  };

  const canWrite = user?.role === "admin" || user?.role === "corporate_officer";

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
          法人の所在地や法人番号、地図登録状況を一目で把握できます。
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
              法人検索
            </h2>
            <p className="text-sm text-slate-500">
              名称・住所・法人番号で絞り込みができます。
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
                placeholder="例：株式会社あいかん"
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
                  </div>
                </div>
              )}
            </div>

            {/* 新規作成ボタン */}
            {canWrite && (
              <button
                onClick={() => {
                  setEditingCorporation(null);
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
          {paginatedCorporations.map((corporation) => {
            const address = [
              corporation.address_prefecture,
              corporation.address_city,
              corporation.address_building,
            ].filter(Boolean).join(" ");
            const [lat, lng] = corporation.latitude_longitude
              ? corporation.latitude_longitude.split(",").map((s) => s.trim())
              : [null, null];
            
            return (
              <div
                key={corporation.corporation_id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      法人名
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {corporation.name}
                    </h3>
                    {corporation.name_kana && (
                      <p className="text-sm text-slate-500">
                        ({corporation.name_kana})
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      法人番号: {corporation.corporation_number ?? "―"}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                    #{corporation.corporation_id}
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
                  {corporation.contact_email && (
                    <div className="flex items-start gap-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">
                          連絡先メール
                        </dt>
                        <dd>{corporation.contact_email}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            );
          })}
        </div>

        {!isLoading && !filteredCorporations.length && (
          <p className="mt-6 text-center text-sm text-slate-400">
            条件に一致する法人が見つかりませんでした。
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
              {filteredCorporations.length}件中 {((page - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(page * ITEMS_PER_PAGE, filteredCorporations.length)}件を表示
            </p>
          </div>
        )}
      </Card>

      <Card title="全法人一覧">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>名称</TableHeaderCell>
              <TableHeaderCell>法人番号</TableHeaderCell>
              <TableHeaderCell>住所</TableHeaderCell>
              <TableHeaderCell>連絡先</TableHeaderCell>
              {canWrite && <TableHeaderCell>操作</TableHeaderCell>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4} className="text-center text-slate-400">
                  法人を読み込み中...
                </TableCell>
              </TableRow>
            )}
            {paginatedCorporations.map((corporation) => {
              const address = [
                corporation.address_prefecture,
                corporation.address_city,
                corporation.address_building,
              ].filter(Boolean).join(" ");
              
              return (
                <TableRow key={corporation.corporation_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{corporation.name}</div>
                      {corporation.name_kana && (
                        <div className="text-sm text-slate-500">
                          {corporation.name_kana}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{corporation.corporation_number ?? "―"}</TableCell>
                  <TableCell>{address || "未登録"}</TableCell>
                  <TableCell>
                    <div>
                      {corporation.phone_number && (
                        <div>{corporation.phone_number}</div>
                      )}
                      {corporation.contact_email && (
                        <div className="text-sm text-slate-500">
                          {corporation.contact_email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCorporation(corporation)}
                          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
                          title="編集"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCorporation(corporation)}
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
            {!isLoading && !filteredCorporations.length && (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4} className="text-center text-slate-400">
                  法人がまだ登録されていません。
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
              {filteredCorporations.length}件中 {((page - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(page * ITEMS_PER_PAGE, filteredCorporations.length)}件を表示
            </p>
          </div>
        )}
      </Card>

      {/* フォームモーダル */}
      <CorporationFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingCorporation ? handleUpdateCorporation : handleCreateCorporation}
        corporation={editingCorporation}
        mode={editingCorporation ? "edit" : "create"}
      />
    </div>
  );
}

