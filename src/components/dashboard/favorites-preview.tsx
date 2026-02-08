import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { FavoriteWithPrice } from "@/types";

interface FavoritesPreviewProps {
  favorites: FavoriteWithPrice[];
}

export function FavoritesPreview({ favorites }: FavoritesPreviewProps) {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Favorites</CardTitle>
        <Link href="/favorites">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={`/products/${fav.productId}`}
              className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400 flex-shrink-0" />
                <span className="text-sm text-stone-700 truncate">{fav.productName}</span>
              </div>
              {fav.lowestPriceCents !== null && (
                <span className="text-sm font-semibold text-green-800 flex-shrink-0 ml-2">
                  {formatCurrency(fav.lowestPriceCents)}
                </span>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
