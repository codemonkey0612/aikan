import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useResidents } from "../hooks/useResidents";
import { useFacilities } from "../hooks/useFacilities";
import { Card } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";

export function ResidentsPage() {
  const { data: residents, isLoading } = useResidents();
  const { data: facilities } = useFacilities();

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

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          ケア
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">入居者</h1>
      </header>

      <Card title="入居者リスト">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>氏名</TableHeaderCell>
              <TableHeaderCell>施設</TableHeaderCell>
              <TableHeaderCell>ステータス</TableHeaderCell>
              <TableHeaderCell />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  入居者を読み込み中...
                </TableCell>
              </TableRow>
            )}
            {residents?.map((resident) => {
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
            {!isLoading && !residents?.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  入居者がまだ登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

