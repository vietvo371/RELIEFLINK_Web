"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ResourceTypeChartProps {
  data: {
    categories: string[];
    data: number[];
  };
}

export default function ResourceTypeChart({ data }: ResourceTypeChartProps) {
  const options: ApexOptions = {
    colors: [
      "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", 
      "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
    ],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 300,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 700,
              color: "#1F2937",
              formatter: (val: string) => `${val}`,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Tổng nguồn lực",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => {
                const total = data.data.reduce((sum, val) => sum + val, 0);
                return `${total}`;
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      labels: {
        colors: "#6B7280",
      },
      markers: {
        width: 8,
        height: 8,
        radius: 4,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} nguồn lực`,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = data.data;

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={300}
      />
    </div>
  );
}
