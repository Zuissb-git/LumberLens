import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDistance, savingsPercent } from "@/lib/utils";
import { MapPin, Package, TrendingDown } from "lucide-react";
import type { SearchResult } from "@/types";

interface ResultCardProps {
  result: SearchResult;
  highestPrice?: number;
}

export function ResultCard({ result, highestPrice }: ResultCardProps) {
  const savings = highestPrice ? savingsPercent(result.priceCents, highestPrice) : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Product name */}
            <h3 className="font-semibold text-stone-900 truncate">
              {result.productName}
            </h3>

            {/* Vendor info */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-stone-600">{result.vendorName}</span>
              {result.vendorChain && (
                <Badge variant="secondary">{result.vendorChain}</Badge>
              )}
            </div>

            {/* Details row */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-500">
              {result.distance !== null && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(result.distance)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {result.inStock ? "In Stock" : "Out of Stock"}
              </span>
              {result.boardFeet && (
                <span>{result.boardFeet.toFixed(2)} BF</span>
              )}
              {result.source === "user" && (
                <Badge variant="warning">Unverified</Badge>
              )}
            </div>
          </div>

          {/* Price column */}
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-green-800">
              {formatCurrency(result.priceCents)}
            </div>
            <div className="text-xs text-stone-500">per piece</div>
            {result.pricePerBfCents && (
              <div className="text-xs text-stone-400 mt-0.5">
                {formatCurrency(result.pricePerBfCents)}/BF
              </div>
            )}
            {savings > 0 && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  Save {savings}%
                </span>
              </div>
            )}
          </div>
        </div>

        {!result.inStock && (
          <div className="mt-2 px-2 py-1 bg-amber-50 rounded text-xs text-amber-700">
            Currently out of stock at this location
          </div>
        )}
      </CardContent>
    </Card>
  );
}
