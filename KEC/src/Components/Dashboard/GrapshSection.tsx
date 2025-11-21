// Import necessary libraries
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from "recharts";

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

interface GrapshSectionProps {
  data: DataPoint[];
}

const GrapshSection: React.FC<GrapshSectionProps> = ({ data }) => {
  // Removed internal fetching logic as data is now passed via props

  return (
    <div className="w-full h-[270px] p-4 rounded-xl">
      <h2 className="text-lg font-semibold mb-6">Course Overview</h2>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 13, fill: "#888" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 12, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Course sales",
              angle: -90,
              position: "insideLeft",
              offset: 20,
              fontWeight: "normal",
              fill: "#222",
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Revenue",
              angle: 90,
              position: "insideRight",
              offset: 13,
              fontWeight: "normal",
              fill: "#222",
              fontSize: 14,
            }}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
            formatter={(value, name) =>
              name === "Revenue" || name === "revenue" ? `${value} frw` : value
            }
          />
          <Legend
            iconType="circle"
            iconSize={8}
            layout="horizontal"
            verticalAlign="top"
            align="right"
            wrapperStyle={{
              top: -45,
              left: 250,
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="sales"
            fill="#E69A54"
            name="Course Sale"
            radius={[1, 1, 0, 0]}
            barSize={20}
          />
          <Line
            yAxisId="right"
            type="natural"
            dataKey="revenue"
            stroke="#0f172a"
            strokeWidth={1}
            dot={{ r: 0, stroke: "#0f172a", strokeWidth: 0, fill: "#fff" }}
            name="Revenue"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrapshSection;
