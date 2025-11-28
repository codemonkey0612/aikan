import { useSalaries } from "../hooks/useSalaries";
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

export function SalariesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useSalaries();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          経理
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">給与</h1>
      </header>

      <Card title="支給履歴">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>看護師</TableHeaderCell>
              <TableHeaderCell>対象月</TableHeaderCell>
              <TableHeaderCell className="text-right">
                支給額
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  給与データを読み込み中...
                </TableCell>
              </TableRow>
            )}
            {data?.map((salary) => (
              <TableRow key={salary.id}>
                <TableCell>#{salary.user_id}</TableCell>
                <TableCell>{salary.year_month}</TableCell>
                <TableCell className="text-right">
                  ¥{salary.amount ?? 0}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  給与データがありません。
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

