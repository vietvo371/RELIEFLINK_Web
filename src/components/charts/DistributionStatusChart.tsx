"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface DistributionStatusChartProps {
  data: {
    categories: string[];
    data: number[];
  };
}

export default function DistributionStatusChart({ data }: DistributionStatusChartProps) {
  const options: ApexOptions = {
    colors: ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 300,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    markers: {
      size: 6,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => `${val} phân phối`,
      },
    },
    xaxis: {
      categories: data.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Số lượng phân phối",
        style: {
          color: "#6B7280",
          fontSize: "12px",
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "12px",
      labels: {
        colors: "#6B7280",
      },
    },
  };

  const series = [
    {
      name: "Trạng thái phân phối",
      data: data.data,
    },
  ];

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={300}
      />
    </div>
  );
}
