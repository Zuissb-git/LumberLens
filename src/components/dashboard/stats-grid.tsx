import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Package, DollarSign, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatsGridProps {
  stats: {
    tier: string;
    buildOrderCount: number;
    pricesSubmittedCount: number;
    totalSavingsCents: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p className="text-sm text-stone-500">Account Tier</p>
            <Badge className="mt-0.5 capitalize">{stats.tier}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-stone-500">Build Orders</p>
            <p className="text-lg font-semibold text-stone-900">{stats.buildOrderCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-stone-500">Prices Submitted</p>
            <p className="text-lg font-semibold text-stone-900">{stats.pricesSubmittedCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm text-stone-500">Total Savings</p>
            <p className="text-lg font-semibold text-stone-900">
              {stats.totalSavingsCents > 0 ? formatCurrency(stats.totalSavingsCents) : "$0.00"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
