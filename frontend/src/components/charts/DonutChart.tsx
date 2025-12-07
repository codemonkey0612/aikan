import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title: string;
  centerValue?: string;
  centerLabel?: string;
}

export function DonutChart({
  data,
  title,
  centerValue,
  centerLabel,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percentage = data.length > 0 ? Math.round((data[0].value / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: "28px", fontWeight: "bold", fill: "#0f172a" }}
          >
            {centerValue || `${percentage}%`}
          </text>
          {centerLabel && (
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: "14px", fill: "#475569" }}
            >
              {centerLabel}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

