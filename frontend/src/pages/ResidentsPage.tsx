import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useResidents, useCreateResident, useUpdateResident, useDeleteResident } from "../hooks/useResidents";
import { useFacilities } from "../hooks/useFacilities";
import { useAuth } from "../hooks/useAuth";
import { ResidentFormModal } from "../components/residents/ResidentFormModal";
import { Card } from "../components/ui/Card";
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
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Resident } from "../api/types";

const ITEMS_PER_PAGE = 20;

export function ResidentsPage() {
  const { user } = useAuth();
  const { data: residents, isLoading } = useResidents();
  const { data: facilities } = useFacilities();
  const createResidentMutation = useCreateResident();
  const updateResidentMutation = useUpdateResident();
  const deleteResidentMutation = useDeleteResident();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 施設IDから施設名へのマッピング
  const facilityMap = useMemo(() => {
    const map = new Map<string, string>();
    facilities?.forEach((facility) => {
      if (facility.facility_id) {
        map.set(facility.facility_id, facility.name);
      }
    });
    return map;
  }, [facilities]);

  // ステータスを取得する関数
  const getResidentStatus = (resident: any) => {
    if (resident.is_excluded) {
      return "除外";
    }
    if (resident.discharge_date) {
      const dischargeDate = new Date(resident.discharge_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dischargeDate < today) {
        return "退所済み";
      }
      return "退所予定";
    }
    if (resident.admission_date) {
      return "入所中";
    }
    if (resident.status_id) {
      return resident.status_id;
    }
    return "未設定";
  };

  // フィルタリングと検索
  const filteredResidents = useMemo(() => {
    if (!residents) return [];
    
    let filtered = residents;

    // 検索クエリでフィルタリング
    if (query.trim()) {
      const keyword = query.trim().toLowerCase();
      filtered = filtered.filter((resident) => {
        const fullName = `${resident.last_name || ""} ${resident.first_name || ""}`.toLowerCase();
        const kanaName = `${resident.last_name_kana || ""} ${resident.first_name_kana || ""}`.toLowerCase();
        return fullName.includes(keyword) || kanaName.includes(keyword);
      });
    }

    // 施設フィルター
    if (facilityFilter !== "all") {
      filtered = filtered.filter((r) => r.facility_id === facilityFilter);
    }

    // ステータスフィルター
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => {
        const status = getResidentStatus(r);
        return status === statusFilter;
      });
    }

    return filtered;
  }, [residents, query, facilityFilter, statusFilter]);

  // ページネーション計算
  const paginatedResidents = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredResidents.slice(startIndex, endIndex);
  }, [filteredResidents, page]);

  const totalPages = Math.ceil(filteredResidents.length / ITEMS_PER_PAGE);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleCreateResident = async (data: any) => {
    await createResidentMutation.mutateAsync(data);
  };

  const handleUpdateResident = async (data: any) => {
    if (editingResident) {
      await updateResidentMutation.mutateAsync({ resident_id: editingResident.resident_id, data });
    }
  };

  const handleDeleteResident = async (resident: Resident) => {
    if (window.confirm(`${resident.last_name} ${resident.first_name} を削除してもよろしいですか？`)) {
      await deleteResidentMutation.mutateAsync(resident.resident_id);
    }
  };

  const handleEditResident = (resident: Resident) => {
    setEditingResident(resident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResident(null);
  };

  const canWrite = user?.role === "admin" || user?.role === "facility_manager";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          ケア
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">入居者</h1>
      </header>

      <Card title="入居者リスト">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            {/* 検索バー */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="検索"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

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
                        施設
                      </label>
                      <select
                        value={facilityFilter}
                        onChange={(e) => {
                          setFacilityFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        <option value="all">すべて</option>
                        {facilities?.map((facility) => (
                          <option key={facility.facility_id} value={facility.facility_id}>
                            {facility.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        ステータス
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        <option value="all">すべて</option>
                        <option value="入所中">入所中</option>
                        <option value="退所済み">退所済み</option>
                        <option value="退所予定">退所予定</option>
                        <option value="除外">除外</option>
                        <option value="未設定">未設定</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 新規作成ボタン */}
          {canWrite && (
            <button
              onClick={() => {
                setEditingResident(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
            >
              <PlusIcon className="h-4 w-4" />
              新規作成
            </button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>氏名</TableHeaderCell>
              <TableHeaderCell>施設</TableHeaderCell>
              <TableHeaderCell>ステータス</TableHeaderCell>
              {canWrite && <TableHeaderCell>操作</TableHeaderCell>}
              <TableHeaderCell />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4} className="text-center text-slate-400">
                  入居者を読み込み中...
                </TableCell>
              </TableRow>
            )}
            {paginatedResidents.map((resident) => {
              const facilityName = resident.facility_id
                ? facilityMap.get(resident.facility_id) || "未設定"
                : "未設定";
              const status = getResidentStatus(resident);

              return (
                <TableRow key={resident.resident_id}>
                  <TableCell>
                    <Link
                      to={`/residents/${resident.resident_id}`}
                      className="text-brand-600 underline-offset-4 hover:underline"
                    >
                      {resident.last_name} {resident.first_name}
                    </Link>
                  </TableCell>
                  <TableCell>{facilityName}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        status === "入所中"
                          ? "bg-green-100 text-green-700"
                          : status === "退所済み"
                          ? "bg-slate-100 text-slate-700"
                          : status === "退所予定"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "除外"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {status}
                    </span>
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditResident(resident)}
                          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
                          title="編集"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResident(resident)}
                          className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                          title="削除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Link
                      to={`/residents/${resident.resident_id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      詳細
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && !filteredResidents.length && (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4} className="text-center text-slate-400">
                  入居者がまだ登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
            <p className="mt-2 text-center text-sm text-slate-500">
              {filteredResidents.length}件中 {((page - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(page * ITEMS_PER_PAGE, filteredResidents.length)}件を表示
            </p>
          </div>
        )}
      </Card>

      {/* フォームモーダル */}
      <ResidentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingResident ? handleUpdateResident : handleCreateResident}
        resident={editingResident}
        mode={editingResident ? "edit" : "create"}
      />
    </div>
  );
}

