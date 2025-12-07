import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RadarChartProps {
  data: Array<{
    category: string;
    [key: string]: string | number;
  }>;
  dataKeys: Array<{ key: string; name: string; color: string; opacity?: number }>;
  title: string;
}

export function RadarChartComponent({
  data,
  dataKeys,
  title,
}: RadarChartProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          {dataKeys.map(({ key, name, color, opacity = 0.6 }) => (
            <Radar
              key={key}
              name={name}
              dataKey={key}
              stroke={color}
              fill={color}
              fillOpacity={opacity}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

