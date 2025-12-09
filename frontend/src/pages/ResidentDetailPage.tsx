import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  HeartIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useResident } from "../hooks/useResidents";
import { useFacilities } from "../hooks/useFacilities";
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
import { FileUpload } from "../components/files/FileUpload";
import { FileList } from "../components/files/FileList";

export function ResidentDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const residentId = params.id;
  const { data: resident, isLoading } = useResident(residentId);
  const { data: facilities } = useFacilities();

  // 施設IDから施設名へのマッピング
  const facilityName = useMemo(() => {
    if (!resident?.facility_id) return "未設定";
    const facility = facilities?.find((f) => f.facility_id === resident.facility_id);
    return facility?.name || "未設定";
  }, [resident?.facility_id, facilities]);

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
            {resident?.last_name} {resident?.first_name}{" "}
            <span className="text-slate-400">#{resident?.resident_id}</span>
          </h1>
          <p className="text-slate-500">
            施設: {facilityName}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/residents/${residentId}/care-plan`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            ケアプラン
          </Link>
          <Link
            to={`/facilities`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            <BuildingOffice2Icon className="h-5 w-5" />
            施設一覧へ
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="施設"
          value={facilityName}
          icon={<BuildingOffice2Icon className="h-6 w-6" />}
        />
        <SummaryCard
          title="ステータス"
          value={resident?.status_id ?? "不明"}
          icon={<HeartIcon className="h-6 w-6" />}
        />
        <SummaryCard
          title="入所日"
          value={
            resident?.admission_date
              ? new Date(resident.admission_date).toLocaleDateString("ja-JP")
              : "未設定"
          }
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
                {resident?.last_name} {resident?.first_name}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>入所日</TableCell>
              <TableCell>
                {resident?.admission_date
                  ? new Date(resident.admission_date).toLocaleDateString("ja-JP")
                  : "未登録"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>退所日</TableCell>
              <TableCell>
                {resident?.discharge_date
                  ? new Date(resident.discharge_date).toLocaleDateString("ja-JP")
                  : "未登録"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ステータスID</TableCell>
              <TableCell>{resident?.status_id ?? "未登録"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>施設</TableCell>
              <TableCell>{facilityName}</TableCell>
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

      {residentId && (
        <Card title="画像">
          <div className="space-y-4">
            <FileUpload
              category="RESIDENT_IMAGE"
              entity_type="resident"
              entity_id={parseInt(residentId) || 0}
              accept="image/*"
            />
            <FileList
              category="RESIDENT_IMAGE"
              entity_type="resident"
              entity_id={parseInt(residentId) || 0}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

