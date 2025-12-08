import { useMemo } from "react";
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
import { MonthlyBarChart } from "../components/charts/MonthlyBarChart";
import { LineAreaChart } from "../components/charts/LineAreaChart";
import { DonutChart } from "../components/charts/DonutChart";
import { RadarChartComponent } from "../components/charts/RadarChart";
import {
  getMonthlyFacilityData,
  getMonthlyResidentData,
  getOccupancyData,
  getStatisticsData,
  getMonthlyShiftData,
} from "../utils/chartData";

export function OverviewPage() {
  const { data: facilities } = useFacilities();
  const { data: residents } = useResidents();
  const { data: allShifts } = useShifts();
  const { data: shifts } = useShifts({ limit: 5 });
  const { data: vitals } = useVitals({ limit: 5 });

  // Chart data
  const monthlyFacilityData = useMemo(() => {
    const data = getMonthlyFacilityData(facilities);
    // Format for bar chart with multiple years (simulated for comparison)
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const twoYearsAgo = currentYear - 2;
    
    return data.slice(-9).map((item, idx) => ({
      month: item.month,
      [currentYear]: item.count + (idx % 3),
      [lastYear]: item.count + (idx % 2),
      [twoYearsAgo]: item.count,
    }));
  }, [facilities]);

  const monthlyResidentData = useMemo(
    () => getMonthlyResidentData(residents),
    [residents]
  );

  const shiftArray = useMemo(() => {
    if (!allShifts) return undefined;
    return Array.isArray(allShifts) ? allShifts : allShifts.data || [];
  }, [allShifts]);

  const monthlyShiftData = useMemo(
    () => getMonthlyShiftData(shiftArray),
    [shiftArray]
  );

  const occupancyData = useMemo(() => getOccupancyData(facilities), [facilities]);

  const statisticsData = useMemo(
    () => getStatisticsData(facilities, residents, shiftArray),
    [facilities, residents, shiftArray]
  );

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
          value={`${shifts?.data?.length ?? 0}/42`}
          change="稼働率 96%"
          icon={<ClockIcon className="h-6 w-6" />}
        />
        <SummaryCard
          title="本日のバイタル"
          value={vitals?.data?.length ?? 0}
          change="本日 +8"
          icon={<HeartIcon className="h-6 w-6" />}
        />
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <MonthlyBarChart
          data={monthlyFacilityData}
          dataKeys={[
            { key: String(new Date().getFullYear() - 2), name: String(new Date().getFullYear() - 2), color: "#60a5fa" },
            { key: String(new Date().getFullYear() - 1), name: String(new Date().getFullYear() - 1), color: "#f472b6" },
            { key: String(new Date().getFullYear()), name: String(new Date().getFullYear()), color: "#a78bfa" },
          ]}
          title="月別施設数"
        />
        <RadarChartComponent
          data={statisticsData.map((item) => ({
            ...item,
            target: Math.min(100, item.value + 20),
          }))}
          dataKeys={[
            { key: "value", name: "現在", color: "#3b82f6", opacity: 0.6 },
            { key: "target", name: "目標", color: "#ec4899", opacity: 0.3 },
          ]}
          title="統計"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <LineAreaChart
          data={monthlyResidentData}
          title="入居者数推移"
          color="#3b82f6"
        />
        <DonutChart
          data={[
            {
              name: "入居中",
              value: occupancyData.occupied,
              color: "#f472b6",
            },
            {
              name: "空き",
              value: occupancyData.available,
              color: "#e2e8f0",
            },
          ]}
          title="入居率"
          centerValue={`${occupancyData.percentage}%`}
          centerLabel="利用率"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <LineAreaChart
          data={monthlyShiftData}
          title="月別シフト数"
          color="#10b981"
        />
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">直近のシフト</h3>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>看護師</TableHeaderCell>
                <TableHeaderCell>施設</TableHeaderCell>
                <TableHeaderCell className="text-right">日付</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts?.data?.map((shift) => (
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
              {!shifts?.data?.length && (
                <TableRow>
                  <TableCell className="text-center text-slate-400" colSpan={3}>
                    シフトはまだ登録されていません。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </div>
      </section>

      <section>
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">最新のバイタル</h3>
          <div className="overflow-x-auto">
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
              {vitals?.data?.map((record) => (
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
              {!vitals?.data?.length && (
                <TableRow>
                  <TableCell className="text-center text-slate-400" colSpan={3}>
                    バイタルはまだ登録されていません。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </section>
    </div>
  );
}

