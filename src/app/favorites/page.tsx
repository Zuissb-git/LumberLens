"use client";

import { useEffect, useState } from "react";
import { FavoriteCard } from "@/components/favorites/favorite-card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Search } from "lucide-react";
import Link from "next/link";
import type { FavoriteWithPrice } from "@/types";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        setFavorites(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Favorites</h1>
          <p className="text-stone-500 mt-1">
            Track products you&apos;re interested in
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-lg">No favorites yet</p>
          <p className="text-stone-400 text-sm mt-1">
            Search for products and tap the heart to save them here
          </p>
          <Link href="/search">
            <Button variant="outline" className="mt-4">
              <Search className="h-4 w-4 mr-2" />
              Search Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <FavoriteCard
              key={fav.id}
              favorite={fav}
              onRemoved={loadFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
}
