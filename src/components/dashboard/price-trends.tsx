import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceTrend {
  productName: string;
  currentAvgCents: number;
  thirtyDayAgoAvgCents: number;
  trendDirection: string;
  changePercent: number;
}

interface PriceTrendsProps {
  trends: PriceTrend[];
}

export function PriceTrends({ trends }: PriceTrendsProps) {
  if (trends.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Trends (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trends.map((trend) => (
            <div key={trend.productName} className="flex items-center justify-between py-1">
              <span className="text-sm text-stone-700 truncate flex-1 mr-4">
                {trend.productName}
              </span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-semibold text-stone-900">
                  {formatCurrency(trend.currentAvgCents)}
                </span>
                <div className="flex items-center gap-1 w-20 justify-end">
                  {trend.trendDirection === "up" ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs font-medium text-red-500">
                        +{trend.changePercent}%
                      </span>
                    </>
                  ) : trend.trendDirection === "down" ? (
                    <>
                      <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-600">
                        -{trend.changePercent}%
                      </span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-3.5 w-3.5 text-stone-400" />
                      <span className="text-xs text-stone-400">0%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
