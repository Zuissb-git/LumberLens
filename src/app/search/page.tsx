import { Suspense } from "react";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";

export const metadata = {
  title: "Search Lumber Prices — LumberLens",
};

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Search Lumber Prices</h1>
        <p className="text-stone-500 mt-1">
          Compare prices across vendors near you
        </p>
      </div>

      <Suspense fallback={null}>
        <div className="space-y-6">
          <SearchFilters />
          <SearchResults />
        </div>
      </Suspense>
    </div>
  );
}
