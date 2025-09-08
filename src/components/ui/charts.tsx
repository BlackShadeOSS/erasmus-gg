"use client";

import { useMemo } from "react";

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  className?: string;
  maxHeight?: number;
}

export function BarChart({
  data,
  className = "",
  maxHeight = 100,
}: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);

  return (
    <div className={`flex items-end gap-2 h-${maxHeight} ${className}`}>
      {data.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-1 min-w-0 flex-1"
        >
          <div className="text-xs text-neutral-400 font-medium">
            {item.value}
          </div>
          <div
            className={`w-full rounded-t ${
              item.color || "bg-amber-500"
            } min-h-[4px]`}
            style={{
              height:
                maxValue > 0
                  ? `${(item.value / maxValue) * maxHeight}px`
                  : "4px",
            }}
          />
          <div className="text-xs text-neutral-500 text-center truncate w-full">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  className?: string;
  size?: number;
}

export function DonutChart({
  data,
  className = "",
  size = 80,
}: DonutChartProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  const segments = useMemo(() => {
    let cumulativePercentage = 0;
    return data.map((item) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      cumulativePercentage += percentage;

      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
      };
    });
  }, [data, total]);

  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;

  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(size / 2, size / 2, radius, endAngle);
    const end = polarToCartesian(size / 2, size / 2, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const innerStart = polarToCartesian(
      size / 2,
      size / 2,
      innerRadius,
      endAngle
    );
    const innerEnd = polarToCartesian(
      size / 2,
      size / 2,
      innerRadius,
      startAngle
    );

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      innerEnd.x,
      innerEnd.y,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      "Z",
    ].join(" ");
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              className="transition-opacity hover:opacity-80"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-neutral-100">{total}</div>
            <div className="text-xs text-neutral-400">Razem</div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-neutral-300 flex-1">{segment.label}</span>
            <span className="text-neutral-400">{segment.value}</span>
            <span className="text-neutral-500">
              ({segment.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
