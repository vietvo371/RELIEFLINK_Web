"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PredictionChartProps {
  data: Array<{
    tinh_thanh: string;
    loai_thien_tai: string;
    du_doan_nhu_cau_thuc_pham: number;
    du_doan_nhu_cau_nuoc: number;
    du_doan_nhu_cau_thuoc: number;
    du_doan_nhu_cau_cho_o: number;
  }>;
  type?: "line" | "bar";
}

export default function PredictionChart({
  data,
  type = "bar",
}: PredictionChartProps) {
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.tinh_thanh,
    "Thực phẩm": item.du_doan_nhu_cau_thuc_pham,
    "Nước": item.du_doan_nhu_cau_nuoc,
    "Thuốc": item.du_doan_nhu_cau_thuoc,
    "Chỗ ở": item.du_doan_nhu_cau_cho_o,
  }));

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Thực phẩm" stroke="#2E7D32" />
          <Line type="monotone" dataKey="Nước" stroke="#1976D2" />
          <Line type="monotone" dataKey="Thuốc" stroke="#D32F2F" />
          <Line type="monotone" dataKey="Chỗ ở" stroke="#FF9800" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Thực phẩm" fill="#2E7D32" />
        <Bar dataKey="Nước" fill="#1976D2" />
        <Bar dataKey="Thuốc" fill="#D32F2F" />
        <Bar dataKey="Chỗ ở" fill="#FF9800" />
      </BarChart>
    </ResponsiveContainer>
  );
}

