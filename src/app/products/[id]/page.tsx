"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { PriceHistoryChart } from "@/components/products/price-history-chart";
import { CurrentPricesTable } from "@/components/products/current-prices-table";
import { SetAlertDialog } from "@/components/products/set-alert-dialog";
import { ArrowLeft, Bell, Loader2 } from "lucide-react";

interface ProductDetail {
  id: string;
  name: string;
  species: string;
  grade: string;
  treatment: string;
  nominalWidth: number;
  nominalDepth: number;
  actualWidth: number;
  actualDepth: number;
  lengthFt: number;
  boardFeet: number;
  category: string;
  listings: {
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
  }[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Check if favorited
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((favs) => {
        if (Array.isArray(favs)) {
          setIsFavorited(favs.some((f: { productId: string }) => f.productId === id));
        }
      })
      .catch(() => {});
  }, [session, id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500">Product not found.</p>
        <Link href="/search">
          <Button variant="outline" className="mt-4">Back to Search</Button>
        </Link>
      </div>
    );
  }

  const lowestPrice = product.listings.length > 0 ? product.listings[0].priceCents : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Link href="/search">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900">{product.name}</h1>
              <FavoriteButton productId={id} isFavorited={isFavorited} />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{product.species}</Badge>
              <Badge variant="outline">{product.grade}</Badge>
              <Badge variant="outline">{product.category}</Badge>
              {product.treatment !== "none" && (
                <Badge variant="outline">{product.treatment}</Badge>
              )}
            </div>
          </div>
        </div>
        {session?.user && (
          <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
            <Bell className="h-3.5 w-3.5 mr-1" />
            Set Alert
          </Button>
        )}
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-stone-50 rounded-lg p-3">
          <p className="text-xs text-stone-500">Nominal Size</p>
          <p className="font-semibold text-stone-900">
            {product.nominalWidth}&quot;x{product.nominalDepth}&quot;
          </p>
        </div>
        <div className="bg-stone-50 rounded-lg p-3">
          <p className="text-xs text-stone-500">Actual Size</p>
          <p className="font-semibold text-stone-900">
            {product.actualWidth}&quot;x{product.actualDepth}&quot;
          </p>
        </div>
        <div className="bg-stone-50 rounded-lg p-3">
          <p className="text-xs text-stone-500">Length</p>
          <p className="font-semibold text-stone-900">{product.lengthFt} ft</p>
        </div>
        <div className="bg-stone-50 rounded-lg p-3">
          <p className="text-xs text-stone-500">Board Feet</p>
          <p className="font-semibold text-stone-900">{product.boardFeet.toFixed(2)} BF</p>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="mb-6">
        <PriceHistoryChart productId={id} />
      </div>

      {/* Current Prices */}
      <CurrentPricesTable listings={product.listings} />

      {/* Alert Dialog */}
      <SetAlertDialog
        productId={id}
        productName={product.name}
        currentLowestCents={lowestPrice}
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        onCreated={() => {}}
      />
    </div>
  );
}
