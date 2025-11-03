"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ReliefPriorityChartProps {
  data: {
    categories: string[];
    data: number[];
  };
}

export default function ReliefPriorityChart({ data }: ReliefPriorityChartProps) {
  const options: ApexOptions = {
    colors: ["#10B981", "#F59E0B", "#EF4444"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 8,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
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
        text: "Số lượng yêu cầu",
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
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 0.8,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} yêu cầu`,
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Yêu cầu",
      data: data.data,
    },
  ];

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={300}
      />
    </div>
  );
}
