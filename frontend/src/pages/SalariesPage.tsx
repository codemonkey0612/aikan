import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useSalaries, useCalculateNurseSalary, useCalculateAndSaveSalary } from "../hooks/useSalaries";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/Card";
import { FileUpload } from "../components/files/FileUpload";
import { FileList } from "../components/files/FileList";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import {
  CalculatorIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { Salary } from "../api/types";

export function SalariesPage() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const calculateAndSaveMutation = useCalculateAndSaveSalary();

  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [selectedYearMonth, setSelectedYearMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading } = useSalaries();
  const { data: calculation, isLoading: isCalculating } = useCalculateNurseSalary(
    selectedNurseId,
    selectedYearMonth,
    !!selectedNurseId && !!selectedYearMonth
  );

  const { data: savedSalaries } = useSalaries({
    nurse_id: selectedNurseId,
    year_month: selectedYearMonth,
  });

  const userList = useMemo(() => {
    return Array.isArray(users) ? users : users?.data || [];
  }, [users]);

  const nurses = useMemo(() => {
    return userList.filter((u) => u.nurse_id && u.role === "nurse");
  }, [userList]);

  // Create a map of user_id to user for quick lookup
  const userMap = useMemo(() => {
    const map = new Map<number, (typeof userList)[0]>();
    userList.forEach((u) => {
      if (u?.id) map.set(u.id, u);
    });
    return map;
  }, [userList]);

  // Filter salaries based on search query
  const filteredSalaries = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((salary: Salary) => {
      // Search by nurse_id
      if (salary.nurse_id?.toLowerCase().includes(query)) {
        return true;
      }

      // Search by year_month
      if (salary.year_month?.toLowerCase().includes(query)) {
        return true;
      }

      // Search by nurse name
      const nurseUser = userMap.get(salary.user_id);
      if (nurseUser) {
        const fullName = `${nurseUser.last_name} ${nurseUser.first_name}`.toLowerCase();
        const fullNameKana = `${nurseUser.last_name_kana || ""} ${nurseUser.first_name_kana || ""}`.toLowerCase();
        if (fullName.includes(query) || fullNameKana.includes(query)) {
          return true;
        }
      }

      return false;
    });
  }, [data, searchQuery, userMap]);

  const handleCalculateAndSave = async () => {
    if (!selectedNurseId) {
      toast.error("看護師を選択してください");
      return;
    }
    try {
      await calculateAndSaveMutation.mutateAsync({
        nurse_id: selectedNurseId,
        year_month: selectedYearMonth,
      });
      toast.success("給与を計算して保存しました");
    } catch (error: any) {
      toast.error(`エラー: ${error.message}`);
    }
  };

  const savedSalary = savedSalaries?.[0];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs sm:text-sm uppercase tracking-wide text-slate-500">
          経理
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">給与</h1>
      </header>


      {/* 給与計算 */}
      <Card title="給与計算">
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <UserIcon className="h-4 w-4 inline mr-1" />
                看護師
              </label>
              <select
                value={selectedNurseId}
                onChange={(e) => setSelectedNurseId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">看護師を選択</option>
                {nurses.map((nurse) => (
                  <option key={`nurse-${nurse.id}`} value={nurse.nurse_id || ""}>
                    {nurse.last_name} {nurse.first_name} ({nurse.nurse_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                対象月
              </label>
              <input
                type="month"
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {selectedNurseId && selectedYearMonth && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCalculateAndSave}
                  disabled={calculateAndSaveMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  <CalculatorIcon className="h-4 w-4" />
                  計算して保存
                </button>
              </div>

              {isCalculating && (
                <p className="text-sm text-slate-500">計算中...</p>
              )}

              {calculation && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      計算結果
                    </h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          距離ベース給与
                        </p>
                        <p className="text-xl font-semibold text-slate-900">
                          ¥{calculation.distance_pay.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {calculation.total_distance_km} km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          時間ベース給与
                        </p>
                        <p className="text-xl font-semibold text-slate-900">
                          ¥{calculation.time_pay.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {Math.round(calculation.total_minutes / 60)} 時間
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          バイタルベース給与
                        </p>
                        <p className="text-xl font-semibold text-slate-900">
                          ¥{calculation.vital_pay.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {calculation.total_vital_count} 件
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">合計給与</p>
                        <p className="text-2xl font-bold text-brand-600">
                          ¥{calculation.total_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">
                      詳細情報
                    </h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">総距離:</span>
                        <span className="font-medium">
                          {calculation.total_distance_km} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">総時間:</span>
                        <span className="font-medium">
                          {calculation.total_minutes} 分 ({Math.round(calculation.total_minutes / 60)} 時間)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">バイタル記録数:</span>
                        <span className="font-medium">
                          {calculation.total_vital_count} 件
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {savedSalary && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-800">
                    保存済み給与: ¥{savedSalary.total_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    計算日時:{" "}
                    {savedSalary.calculated_at
                      ? new Date(savedSalary.calculated_at).toLocaleString("ja-JP")
                      : "未設定"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* 支給履歴 */}
      <Card title="支給履歴">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="看護師名、看護師ID、または対象月で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="text-sm">✕</span>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-slate-500">
              {filteredSalaries.length}件の結果が見つかりました
            </p>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>看護師</TableHeaderCell>
              <TableHeaderCell>対象月</TableHeaderCell>
              <TableHeaderCell className="text-right">合計給与</TableHeaderCell>
              <TableHeaderCell className="text-right">距離給与</TableHeaderCell>
              <TableHeaderCell className="text-right">時間給与</TableHeaderCell>
              <TableHeaderCell className="text-right">バイタル給与</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400">
                  給与データを読み込み中...
                </TableCell>
              </TableRow>
            )}
            {filteredSalaries.map((salary: Salary) => {
              const nurseUser = userMap.get(salary.user_id);
              const nurseName = nurseUser 
                ? `${nurseUser.last_name} ${nurseUser.first_name}`
                : null;
              
              return (
                <TableRow key={salary.id}>
                  <TableCell>
                    <div>
                      {nurseName && (
                        <div className="font-medium text-slate-900">{nurseName}</div>
                      )}
                      <div className="text-xs text-slate-500">
                        {salary.nurse_id || `ID: ${salary.user_id}`}
                      </div>
                    </div>
                  </TableCell>
                <TableCell>{salary.year_month}</TableCell>
                <TableCell className="text-right font-semibold">
                  ¥{salary.total_amount?.toLocaleString() ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  ¥{salary.distance_pay?.toLocaleString() ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  ¥{salary.time_pay?.toLocaleString() ?? 0}
                </TableCell>
                  <TableCell className="text-right">
                    ¥{salary.vital_pay?.toLocaleString() ?? 0}
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && !searchQuery && !data?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400">
                  給与データがありません。
                </TableCell>
              </TableRow>
            )}
            {!isLoading && searchQuery && filteredSalaries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400">
                  「{searchQuery}」に一致する給与データが見つかりませんでした。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 給与明細 */}
      {user && (
        <Card title="給与明細">
          <div className="space-y-4">
            <FileUpload
              category="SALARY_STATEMENT"
              entity_type="user"
              entity_id={user.id}
              accept=".pdf"
            />
            <FileList
              category="SALARY_STATEMENT"
              entity_type="user"
              entity_id={user.id}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
