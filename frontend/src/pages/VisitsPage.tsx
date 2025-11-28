import { useState } from "react";
import { useVisits } from "../hooks/useVisits";
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

export function VisitsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useVisits({ page, limit });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          訪問業務
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">訪問記録</h1>
      </header>

      <Card title="直近の訪問">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>シフト</TableHeaderCell>
              <TableHeaderCell>入居者</TableHeaderCell>
              <TableHeaderCell>訪問日時</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  訪問記録を読み込み中...
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>#{visit.shift_id}</TableCell>
                <TableCell>
                  {visit.resident_id ? `#${visit.resident_id}` : "N/A"}
                </TableCell>
                <TableCell>{visit.visited_at}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.data.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  訪問記録がまだありません。
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

