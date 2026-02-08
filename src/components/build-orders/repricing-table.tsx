"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Trophy, Split, AlertTriangle } from "lucide-react";
import type { RepriceResult } from "@/types";

interface RepricingTableProps {
  orderId: string;
}

export function RepricingTable({ orderId }: RepricingTableProps) {
  const [data, setData] = useState<RepriceResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/build-orders/${orderId}/reprice`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
        <span className="ml-2 text-stone-500">Repricing across vendors...</span>
      </div>
    );
  }

  if (!data || data.vendorTotals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-stone-500">
          No vendor pricing data available for these products.
        </CardContent>
      </Card>
    );
  }

  const bestVendor = data.vendorTotals.find((v) => v.missingItems.length === 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bestVendor && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-green-700" />
                <span className="text-sm font-medium text-green-800">Best Single Vendor</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(bestVendor.totalCents)}
              </div>
              <div className="text-sm text-green-700">{bestVendor.vendorName}</div>
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Split className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-800">Split Order Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(data.splitOrderTotalCents)}
            </div>
            <div className="text-sm text-blue-700">Cheapest per item</div>
          </CardContent>
        </Card>

        {data.splitSavingsCents > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-amber-800">Split Order Savings</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {formatCurrency(data.splitSavingsCents)}
              </div>
              <div className="text-sm text-amber-700">
                vs. best single vendor
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Vendor Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 font-medium text-stone-600">Vendor</th>
                  <th className="text-right py-3 px-4 font-medium text-stone-600">Total</th>
                  <th className="text-center py-3 px-4 font-medium text-stone-600">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.vendorTotals.map((vendor, i) => (
                  <tr
                    key={vendor.vendorId}
                    className={`border-b border-stone-100 ${i === 0 && vendor.missingItems.length === 0 ? "bg-green-50" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-900">{vendor.vendorName}</div>
                      {vendor.vendorChain && (
                        <span className="text-xs text-stone-500">{vendor.vendorChain}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(vendor.totalCents)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {vendor.itemCount}/{vendor.itemCount + vendor.missingItems.length}
                    </td>
                    <td className="py-3 px-4">
                      {vendor.missingItems.length === 0 ? (
                        <Badge>All in stock</Badge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <Badge variant="warning">
                            {vendor.missingItems.length} missing
                          </Badge>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Per-Item Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Item Best Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 font-medium text-stone-600">Product</th>
                  <th className="text-center py-3 px-4 font-medium text-stone-600">Qty (w/ waste)</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-600">Best Vendor</th>
                  <th className="text-right py-3 px-4 font-medium text-stone-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.perItemBest.map((item) => (
                  <tr key={item.productId} className="border-b border-stone-100">
                    <td className="py-3 px-4 font-medium text-stone-900">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-stone-600">{item.bestVendorName || "—"}</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {item.bestPriceCents > 0 ? formatCurrency(item.bestPriceCents) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
