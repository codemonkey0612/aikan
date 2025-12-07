import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface LineAreaChartProps {
  data: Array<{
    month: string;
    value: number;
  }>;
  title: string;
  color?: string;
}

export function LineAreaChart({
  data,
  title,
  color = "#3b82f6",
}: LineAreaChartProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <div className="flex gap-2">
          <select className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white">
            <option>年</option>
          </select>
          <select className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white">
            <option>月</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

