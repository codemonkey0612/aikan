import { useMemo, useState } from "react";
import { useFacilities } from "../hooks/useFacilities";
import { Card } from "../components/ui/Card";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import {
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export function FacilitiesPage() {
  const { data, isLoading } = useFacilities();
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    if (!data?.length) {
      return [
        { title: "登録施設数", value: 0, change: "-" },
        { title: "住所登録率", value: "0%", change: "0件" },
        { title: "緯度経度設定", value: "0%", change: "0件" },
        { title: "コード登録数", value: 0, change: "-" },
      ];
    }
    const total = data.length;
    const addressCount = data.filter((f) => !!f.address).length;
    const geoCount = data.filter((f) => !!f.lat && !!f.lng).length;
    const codeCount = data.filter((f) => !!f.code).length;
    const rate = (count: number) =>
      `${Math.round((count / total) * 100) || 0}%`;

    return [
      { title: "登録施設数", value: total, change: "全体" },
      { title: "住所登録率", value: rate(addressCount), change: `${addressCount} / ${total}` },
      { title: "緯度経度設定", value: rate(geoCount), change: `${geoCount} / ${total}` },
      { title: "コード登録数", value: codeCount, change: "-" },
    ];
  }, [data]);

  const filteredFacilities = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data;
    const keyword = query.trim().toLowerCase();
    return data.filter((facility) => {
      const haystack = `${facility.name ?? ""}${facility.address ?? ""}${
        facility.code ?? ""
      }`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [data, query]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          ネットワーク
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          施設リスト
        </h1>
        <p className="text-slate-500">
          施設の所在地やコード、地図登録状況を一目で把握できます。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <SummaryCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={<BuildingOffice2Icon className="h-6 w-6" />}
          />
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              施設検索
            </h2>
            <p className="text-sm text-slate-500">
              名称・住所・コードで絞り込みができます。
            </p>
          </div>
          <label className="relative w-full lg:w-80">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例：銀河ケアセンター"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    施設名
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {facility.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    コード: {facility.code ?? "―"}
                  </p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  #{facility.id}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 text-brand-500" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      住所
                    </dt>
                    <dd>{facility.address ?? "未設定"}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ClipboardDocumentListIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      緯度 / 経度
                    </dt>
                    <dd>
                      {facility.lat && facility.lng
                        ? `${facility.lat}, ${facility.lng}`
                        : "未登録"}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {!isLoading && !filteredFacilities.length && (
          <p className="mt-6 text-center text-sm text-slate-400">
            条件に一致する施設が見つかりませんでした。
          </p>
        )}
      </Card>

      <Card title="全施設一覧">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>名称</TableHeaderCell>
              <TableHeaderCell>住所</TableHeaderCell>
              <TableHeaderCell>コード</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  施設を読み込み中...
                </TableCell>
              </TableRow>
            )}
            {filteredFacilities.map((facility) => (
              <TableRow key={facility.id}>
                <TableCell>{facility.name}</TableCell>
                <TableCell>{facility.address ?? "未登録"}</TableCell>
                <TableCell>{facility.code ?? "―"}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !filteredFacilities.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  施設がまだ登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

