"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface DataPoint {
  date: string;
  avgCents: number;
  minCents: number;
  count: number;
}

interface PriceHistoryChartProps {
  productId: string;
}

export function PriceHistoryChart({ productId }: PriceHistoryChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${productId}/price-history?days=90`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.dataPoints ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-green-700" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-400 text-center py-4">No price history available</p>
        </CardContent>
      </Card>
    );
  }

  // SVG chart dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.avgCents);
  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + (1 - (d.avgCents - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Y-axis labels
  const yLabels = [minVal, minVal + range / 2, maxVal].map((val) => ({
    val: Math.round(val),
    y: padding.top + (1 - (val - minVal) / range) * chartH,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History (90 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {yLabels.map(({ val, y }) => (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e7e5e4"
                strokeDasharray="4"
              />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-stone-400">
                {formatCurrency(val)}
              </text>
            </g>
          ))}

          {/* Line */}
          <path d={linePath} fill="none" stroke="#15803d" strokeWidth="2" />

          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#15803d" />
          ))}

          {/* X-axis labels (first and last) */}
          {points.length > 0 && (
            <>
              <text
                x={points[0].x}
                y={height - 5}
                textAnchor="start"
                className="text-[10px] fill-stone-400"
              >
                {points[0].date}
              </text>
              <text
                x={points[points.length - 1].x}
                y={height - 5}
                textAnchor="end"
                className="text-[10px] fill-stone-400"
              >
                {points[points.length - 1].date}
              </text>
            </>
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
