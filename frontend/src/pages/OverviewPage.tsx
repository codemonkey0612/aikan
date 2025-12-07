import { SummaryCard } from "../components/dashboard/SummaryCard";
import {
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useFacilities } from "../hooks/useFacilities";
import { useResidents } from "../hooks/useResidents";
import { useShifts } from "../hooks/useShifts";
import { useVitals } from "../hooks/useVitals";
import { Table, TableBody, TableHeader, TableHeaderCell, TableRow, TableCell } from "../components/ui/Table";

export function OverviewPage() {
  const { data: facilities } = useFacilities();
  const { data: residents } = useResidents();
  const { data: shifts } = useShifts({ limit: 5 });
  const { data: vitals } = useVitals({ limit: 5 });

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          おかえりなさい 
        </h1>
        <p className="text-slate-600">
          施設とケア状況のサマリーをご確認ください。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="施設数"
          value={facilities?.length ?? 0}
          change="今月 +3"
          icon={<BuildingOffice2Icon className="h-6 w-6" />}
        />
        <SummaryCard
          title="入居者数"
          value={residents?.length ?? 0}
          change="今週 +12"
          icon={<UserGroupIcon className="h-6 w-6" />}
        />
        <SummaryCard
          title="シフト充足率"
          value={`${shifts?.data.length ?? 0}/42`}
          change="稼働率 96%"
          icon={<ClockIcon className="h-6 w-6" />}
        />
        <SummaryCard
          title="本日のバイタル"
          value={vitals?.data.length ?? 0}
          change="本日 +8"
          icon={<HeartIcon className="h-6 w-6" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">
            直近のシフト
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>看護師</TableHeaderCell>
                <TableHeaderCell>施設</TableHeaderCell>
                <TableHeaderCell className="text-right">日付</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts?.data.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.nurse_id || "未設定"}</TableCell>
                  <TableCell>{shift.facility_name || shift.facility_id || "未設定"}</TableCell>
                  <TableCell className="text-right">
                    {shift.start_datetime 
                      ? new Date(shift.start_datetime).toLocaleDateString("ja-JP")
                      : "未設定"}
                  </TableCell>
                </TableRow>
              ))}
              {!shifts?.data.length && (
                <TableRow>
                  <TableCell className="text-center text-slate-400" colSpan={3}>
                    シフトはまだ登録されていません。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">
            最新のバイタル
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>入居者</TableHeaderCell>
                <TableHeaderCell>血圧</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  体温
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitals?.data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>#{record.resident_id}</TableCell>
                  <TableCell>
                    {record.systolic_bp ?? "--"}/{record.diastolic_bp ?? "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.temperature ?? "--"}°C
                  </TableCell>
                </TableRow>
              ))}
              {!vitals?.data.length && (
                <TableRow>
                  <TableCell className="text-center text-slate-400" colSpan={3}>
                    バイタルはまだ登録されていません。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

