import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Listing {
  id: string;
  vendorName: string;
  vendorChain: string | null;
  vendorLocation: string;
  priceCents: number;
  priceUnit: string;
  pricePerBfCents: number | null;
  inStock: boolean;
  confidence: number;
  source: string;
  updatedAt: string;
}

interface CurrentPricesTableProps {
  listings: Listing[];
}

export function CurrentPricesTable({ listings }: CurrentPricesTableProps) {
  if (listings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-400 text-center py-4">No active listings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Prices ({listings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 font-medium text-stone-600">Vendor</th>
                <th className="text-right py-3 px-4 font-medium text-stone-600">Price</th>
                <th className="text-right py-3 px-4 font-medium text-stone-600">$/BF</th>
                <th className="text-center py-3 px-4 font-medium text-stone-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-stone-600">Source</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, i) => (
                <tr
                  key={listing.id}
                  className={`border-b border-stone-100 ${i === 0 ? "bg-green-50" : ""}`}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-stone-900">{listing.vendorName}</div>
                    <div className="text-xs text-stone-500">
                      {listing.vendorChain && `${listing.vendorChain} · `}
                      {listing.vendorLocation}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${i === 0 ? "text-green-800" : "text-stone-900"}`}>
                      {formatCurrency(listing.priceCents)}
                    </span>
                    <span className="text-xs text-stone-400 ml-1">/{listing.priceUnit === "piece" ? "pc" : listing.priceUnit}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-stone-600">
                    {listing.pricePerBfCents ? formatCurrency(listing.pricePerBfCents) : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {listing.inStock ? (
                      <Badge>In Stock</Badge>
                    ) : (
                      <Badge variant="warning">Out</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={listing.source === "user" ? "warning" : "secondary"}>
                      {listing.source}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
