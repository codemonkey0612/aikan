import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  HeartIcon,
  BuildingOffice2Icon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useResident } from "../hooks/useResidents";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { Card } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";

export function ResidentDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const residentId = params.id ? Number(params.id) : undefined;
  const { data: resident, isLoading } = useResident(residentId);

  const handleBack = () => navigate("/residents");

  if (!residentId) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          入居者一覧に戻る
        </button>
        <Card>
          <p className="text-sm text-slate-500">入居者IDが無効です。</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            入居者一覧に戻る
          </button>
          <p className="mt-2 text-sm uppercase tracking-wide text-slate-500">
            入居者詳細
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {resident?.first_name} {resident?.last_name}{" "}
            <span className="text-slate-400">#{resident?.id}</span>
          </h1>
          <p className="text-slate-500">
            施設ID: #{resident?.facility_id ?? "未設定"}
          </p>
        </div>
        <Link
          to={`/facilities`}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
        >
          <BuildingOffice2Icon className="h-5 w-5" />
          施設一覧へ
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="施設ID"
          value={resident?.facility_id ? `#${resident.facility_id}` : "未設定"}
          icon={<BuildingOffice2Icon className="h-6 w-6" />}
        />
        <SummaryCard
          title="ステータス"
          value={resident?.status ?? "不明"}
          icon={<HeartIcon className="h-6 w-6" />}
        />
        <SummaryCard
          title="性別"
          value={resident?.gender ?? "未設定"}
          icon={<HeartIcon className="h-6 w-6" />}
        />
        <SummaryCard
          title="登録日"
          value={
            resident?.created_at
              ? new Date(resident.created_at).toLocaleDateString("ja-JP")
              : "不明"
          }
          icon={<CalendarIcon className="h-6 w-6" />}
        />
      </section>

      <Card title="基本情報">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>項目</TableHeaderCell>
              <TableHeaderCell>値</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>
                {resident?.first_name} {resident?.last_name}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>誕生日</TableCell>
              <TableCell>
                {resident?.birth_date
                  ? new Date(resident.birth_date).toLocaleDateString("ja-JP")
                  : "未登録"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>性別</TableCell>
              <TableCell>{resident?.gender ?? "未登録"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ステータス</TableCell>
              <TableCell>{resident?.status ?? "未登録"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>施設ID</TableCell>
              <TableCell>#{resident?.facility_id ?? "未設定"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>登録日時</TableCell>
              <TableCell>
                {resident?.created_at
                  ? new Date(resident.created_at).toLocaleString("ja-JP")
                  : "未登録"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {isLoading && (
        <p className="text-center text-sm text-slate-400">読み込み中...</p>
      )}
      {!isLoading && !resident && (
        <p className="text-center text-sm text-slate-400">
          入居者情報が見つかりませんでした。
        </p>
      )}
    </div>
  );
}

