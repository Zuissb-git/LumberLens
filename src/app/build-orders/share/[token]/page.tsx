"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Trophy, Split, AlertTriangle, Share2 } from "lucide-react";
import type { RepriceResult } from "@/types";

interface SharedOrderData {
  name: string;
  notes: string | null;
  wasteFactor: number;
  ownerName: string | null;
  lineItems: {
    id: string;
    quantity: number;
    product: { id: string; name: string; species: string; boardFeet: number };
  }[];
  reprice: RepriceResult;
}

export default function SharedOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<SharedOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/shared/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500">This shared build order is not available.</p>
      </div>
    );
  }

  const { reprice } = data;
  const bestVendor = reprice.vendorTotals.find((v) => v.missingItems.length === 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
          <Share2 className="h-3.5 w-3.5" />
          Shared build order{data.ownerName ? ` by ${data.ownerName}` : ""}
        </div>
        <h1 className="text-2xl font-bold text-stone-900">{data.name}</h1>
        {data.notes && <p className="text-stone-500 mt-1">{data.notes}</p>}
        <Badge variant="secondary" className="mt-2">
          {Math.round(data.wasteFactor * 100)}% waste factor
        </Badge>
      </div>

      {/* Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Items ({data.lineItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-stone-100">
            {data.lineItems.map((item) => (
              <div key={item.id} className="py-2 flex items-center justify-between">
                <span className="text-sm text-stone-700">{item.product.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-stone-500">
                    {item.product.boardFeet.toFixed(1)} BF each
                  </span>
                  <Badge variant="outline">x{item.quantity}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repricing Summary */}
      <div className="space-y-6">
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
                {formatCurrency(reprice.splitOrderTotalCents)}
              </div>
              <div className="text-sm text-blue-700">Cheapest per item</div>
            </CardContent>
          </Card>
          {reprice.splitSavingsCents > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <span className="text-sm font-medium text-amber-800">Split Order Savings</span>
                <div className="text-2xl font-bold text-amber-900">
                  {formatCurrency(reprice.splitSavingsCents)}
                </div>
                <div className="text-sm text-amber-700">vs. best single vendor</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Vendor Comparison */}
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
                  {reprice.vendorTotals.map((vendor, i) => (
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
                            <Badge variant="warning">{vendor.missingItems.length} missing</Badge>
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
      </div>
    </div>
  );
}
