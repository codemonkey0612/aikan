import { useState } from "react";
import { Link } from "react-router-dom";
import { useVitals } from "../hooks/useVitals";
import { Card } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import { Pagination } from "../components/ui/Pagination";

export function VitalsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useVitals({ page, limit });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          健康管理
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">バイタル記録</h1>
      </header>

      <Card
        title="最新のバイタル"
        actions={
          <Link
            to="/vitals/new"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            バイタルを登録
          </Link>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>入居者</TableHeaderCell>
              <TableHeaderCell>血圧</TableHeaderCell>
              <TableHeaderCell>脈拍</TableHeaderCell>
              <TableHeaderCell className="text-right">記録日時</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400">
                  バイタルを読み込み中...
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((record) => (
              <TableRow key={record.id}>
                <TableCell>#{record.resident_id}</TableCell>
                <TableCell>
                  {record.systolic_bp ?? "--"}/{record.diastolic_bp ?? "--"}
                </TableCell>
                <TableCell>{record.pulse ?? "--"} bpm</TableCell>
                <TableCell className="text-right">
                  {record.measured_at ?? "--"}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.data.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400">
                  バイタルがまだ登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
            <p className="mt-2 text-center text-sm text-slate-500">
              {data.pagination.total}件中 {((page - 1) * limit + 1)}-{Math.min(page * limit, data.pagination.total)}件を表示
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

