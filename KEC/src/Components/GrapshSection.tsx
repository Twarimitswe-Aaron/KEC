// Import necessary libraries
import React, { useEffect, useState } from "react";
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
import axios from "axios";

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

// Component definition
const GraphSection = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  // Fallback data in case backend is not ready
  const fallbackData = [
    { month: "Jan", sales: 50, revenue: 400 },
    { month: "Feb", sales: 45, revenue: 350 },
    { month: "Mar", sales: 60, revenue: 500 },
    { month: "Apr", sales: 80, revenue: 650 },
    { month: "May", sales: 60, revenue: 600 },
    { month: "Jun", sales: 40, revenue: 300 },
    { month: "Jul", sales: 50, revenue: 400 },
    { month: "Aug", sales: 75, revenue: 700 },
    { month: "Sep", sales: 65, revenue: 620 },
    { month: "Oct", sales: 70, revenue: 690 },
    { month: "Nov", sales: 55, revenue: 450 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/course-overview");
        // Ensure the data is in the correct format
        const formattedData = Array.isArray(response.data)
          ? response.data
          : fallbackData;
        setData(formattedData);
      } catch (error) {
        console.error(
          "Failed to fetch data from backend, using fallback",
          error
        );
        setData(fallbackData);
      }
    };
    fetchData();
  }, []);

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

export default GraphSection;
