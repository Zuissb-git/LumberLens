"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./favorite-button";
import { formatCurrency } from "@/lib/utils";
import type { FavoriteWithPrice } from "@/types";

interface FavoriteCardProps {
  favorite: FavoriteWithPrice;
  onRemoved?: () => void;
}

export function FavoriteCard({ favorite, onRemoved }: FavoriteCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${favorite.productId}`}
              className="font-semibold text-stone-900 hover:text-green-800 transition-colors truncate block"
            >
              {favorite.productName}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{favorite.species}</Badge>
              <Badge variant="outline">{favorite.category}</Badge>
            </div>
            {favorite.lowestPriceCents !== null ? (
              <div className="mt-2">
                <span className="text-lg font-bold text-green-800">
                  {formatCurrency(favorite.lowestPriceCents)}
                </span>
                <span className="text-xs text-stone-500 ml-1">
                  at {favorite.vendorName}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-stone-400">No current listings</p>
            )}
          </div>
          <FavoriteButton
            productId={favorite.productId}
            isFavorited={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
