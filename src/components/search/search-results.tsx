"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ResultCard } from "./result-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { SearchResult, LocationInfo } from "@/types";

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  locationInfo: LocationInfo;
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search?${searchParams.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
        <span className="ml-2 text-stone-500">Searching prices...</span>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500 text-lg">No results found</p>
        <p className="text-stone-400 text-sm mt-1">
          Try adjusting your filters or expanding the search radius
        </p>
      </div>
    );
  }

  const highestPrice = Math.max(...data.results.map((r) => r.priceCents));

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/search?${params.toString()}`);
  };

  const locationBanner = () => {
    if (!data.locationInfo) return null;
    const { resolved, zipProvided, radiusMiles } = data.locationInfo;

    if (zipProvided && !resolved) {
      return (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Zip code <span className="font-semibold">{zipProvided}</span> not found. Showing all results.
        </div>
      );
    }

    if (zipProvided && resolved) {
      return (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          Showing results within <span className="font-semibold">{radiusMiles} miles</span> of <span className="font-semibold">{zipProvided}</span>
        </div>
      );
    }

    return (
      <div className="mb-4 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
        Enter a zip code to filter by location
      </div>
    );
  };

  return (
    <div>
      {locationBanner()}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">
          {data.total} result{data.total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="space-y-3">
        {data.results.map((result) => (
          <ResultCard
            key={result.listingId}
            result={result}
            highestPrice={highestPrice}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={data.page <= 1}
            onClick={() => goToPage(data.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-stone-500">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.page >= data.totalPages}
            onClick={() => goToPage(data.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
