import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyBarChartProps {
  data: Array<{
    month: string;
    [key: string]: string | number;
  }>;
  dataKeys: Array<{ key: string; name: string; color: string }>;
  title: string;
}

export function MonthlyBarChart({ data, dataKeys, title }: MonthlyBarChartProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#64748b" }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#64748b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          {dataKeys.map(({ key, name, color }) => (
            <Bar
              key={key}
              dataKey={key}
              name={name}
              fill={color}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

