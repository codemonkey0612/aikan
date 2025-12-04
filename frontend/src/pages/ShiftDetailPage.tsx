import { useParams, Link } from "react-router-dom";
import { useShifts } from "../hooks/useShifts";
import { useFacilities } from "../hooks/useFacilities";
import { useUsers } from "../hooks/useUsers";
import { useResidents } from "../hooks/useResidents";
import { useVitals } from "../hooks/useVitals";
import { useAvatar } from "../hooks/useAvatar";
import { FacilityImage } from "../components/shifts/FacilityImage";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { Card } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import type { Shift, Resident, VitalRecord } from "../api/types";

export function ShiftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const shiftId = id ? parseInt(id) : null;

  const { data: shiftsData } = useShifts({ limit: 1000 });
  const shift = shiftsData?.data?.find((s) => s.id === shiftId);

  const { data: facilities } = useFacilities();
  const facility = shift?.facility_id
    ? facilities?.find((f) => f.facility_id === shift.facility_id)
    : null;

  const { data: users } = useUsers();
  const nurse = shift?.nurse_id
    ? users?.find((u) => u.nurse_id === shift.nurse_id)
    : null;

  const { data: residents } = useResidents(shift?.facility_id || undefined);
  const { data: vitalsData } = useVitals({
    limit: 100,
    measured_from: shift?.start_datetime
      ? new Date(shift.start_datetime).toISOString().slice(0, 10)
      : undefined,
  });

  const { data: nurseAvatarUrl } = useAvatar(nurse?.id);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!shift) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">シフトが見つかりませんでした。</p>
      </div>
    );
  }

  const facilityName = facility?.name || shift.facility_name || "施設名なし";
  const facilityNameKana = facility?.name_kana || "";

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/shifts/schedule" className="hover:text-brand-600">
          シフト
        </Link>
        <span>/</span>
        <Link
          to={`/shifts/daily/${shift.start_datetime ? new Date(shift.start_datetime).toISOString().slice(0, 10) : ""}`}
          className="hover:text-brand-600"
        >
          日別シフト
        </Link>
        <span>/</span>
        <span>シフト詳細</span>
      </div>

      {/* 施設情報ヘッダー */}
      <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6">
        {shift.facility_id ? (
          <FacilityImage
            facilityId={shift.facility_id}
            alt={facilityName}
            className="h-24 w-24 rounded-lg object-cover"
          />
        ) : (
          <div className="h-24 w-24 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
            NO IMAGE
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">
            {facilityName}
          </h1>
          {facilityNameKana && (
            <p className="text-sm text-slate-500 mt-1">({facilityNameKana})</p>
          )}
          <div className="mt-2">
            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
              訪問中
            </span>
          </div>
        </div>
      </div>

      {/* コメントセクション */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">コメント</h2>
          <button className="flex items-center gap-2 rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600">
            <PlusIcon className="h-4 w-4" />
            新規
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">No data</p>
        </div>
      </Card>

      {/* 入所者一覧 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">入所者一覧</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search"
                className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <FunnelIcon className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600">
              <PlusIcon className="h-4 w-4" />
              新規
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {residents?.map((resident) => (
            <Link
              key={resident.resident_id}
              to={`/residents/${resident.resident_id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="mb-2">
                <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700">
                  入所中
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">
                {resident.last_name} {resident.first_name}
              </h3>
              {resident.last_name_kana && resident.first_name_kana && (
                <p className="text-sm text-slate-500 mt-1">
                  ({resident.last_name_kana} {resident.first_name_kana})
                </p>
              )}
              {resident.notes && (
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {resident.notes}
                </p>
              )}
            </Link>
          ))}
          {(!residents || residents.length === 0) && (
            <div className="col-span-full text-center py-8 text-sm text-slate-500">
              入所者がまだ登録されていません。
            </div>
          )}
        </div>
      </Card>

      {/* バイタル一覧 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">バイタル一覧</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search"
              className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>氏名</TableHeaderCell>
              <TableHeaderCell>バイタル種別</TableHeaderCell>
              <TableHeaderCell>体温</TableHeaderCell>
              <TableHeaderCell>脈拍</TableHeaderCell>
              <TableHeaderCell>最低血圧</TableHeaderCell>
              <TableHeaderCell>最高血圧</TableHeaderCell>
              <TableHeaderCell>酸素飽和度</TableHeaderCell>
              <TableHeaderCell>備考</TableHeaderCell>
              <TableHeaderCell>実施日時</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vitalsData?.data && vitalsData.data.length > 0 ? (
              vitalsData.data.map((vital) => {
                const resident = residents?.find(
                  (r) => r.resident_id === vital.resident_id
                );
                const residentName = resident
                  ? `${resident.last_name} ${resident.first_name}`
                  : "不明";

                return (
                  <TableRow key={vital.id}>
                    <TableCell>{residentName}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700">
                        著変なし
                      </span>
                    </TableCell>
                    <TableCell>
                      {vital.temperature ? `${vital.temperature}°C` : "--"}
                    </TableCell>
                    <TableCell>
                      {vital.pulse ? `${vital.pulse}回/分` : "--"}
                    </TableCell>
                    <TableCell>
                      {vital.diastolic_bp ? `${vital.diastolic_bp} mmHg` : "--"}
                    </TableCell>
                    <TableCell>
                      {vital.systolic_bp ? `${vital.systolic_bp} mmHg` : "--"}
                    </TableCell>
                    <TableCell>
                      {vital.spo2 ? `${vital.spo2}%` : "--"}
                    </TableCell>
                    <TableCell>{vital.note || "著変なし"}</TableCell>
                    <TableCell>
                      {vital.measured_at
                        ? formatDateTime(vital.measured_at)
                        : "--"}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-slate-400">
                  バイタル記録がまだ登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 看護師情報 */}
      {nurse && (
        <Card>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">看護師情報</h2>
          <div className="flex items-center gap-4">
            {nurseAvatarUrl ? (
              <img
                src={nurseAvatarUrl}
                alt={`${nurse.last_name} ${nurse.first_name}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">
                {nurse.last_name.charAt(0)}
                {nurse.first_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-slate-500">氏名</p>
              <p className="font-semibold text-slate-900">
                {nurse.last_name} {nurse.first_name}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-pink-300 bg-white px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50">
                <PhoneIcon className="h-4 w-4" />
                Call
              </button>
              <button className="rounded-lg border border-pink-300 bg-white px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                SMS
              </button>
              <button className="rounded-lg border border-pink-300 bg-white px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50">
                <EnvelopeIcon className="h-4 w-4" />
                Email
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

