import { Link } from "react-router-dom";
import { useResidents } from "../hooks/useResidents";
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
  const { data, isLoading } = useResidents();

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
            {data?.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell>
                  <Link
                    to={`/residents/${resident.id}`}
                    className="text-brand-600 underline-offset-4 hover:underline"
                  >
                    {resident.first_name} {resident.last_name}
                  </Link>
                </TableCell>
                <TableCell>#{resident.facility_id}</TableCell>
                <TableCell>{resident.status ?? "N/A"}</TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/residents/${resident.id}`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    詳細
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.length && (
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

