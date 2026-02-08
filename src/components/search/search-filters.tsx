"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";
import {
  COMMON_DIMENSIONS,
  COMMON_LENGTHS,
  SPECIES_OPTIONS,
  GRADE_OPTIONS,
  TREATMENT_OPTIONS,
  CATEGORY_OPTIONS,
} from "@/lib/utils/lumber";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key) ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset page on filter change
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => {
    router.push("/search");
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          placeholder='Search lumber (e.g., "2x4 cedar")'
          defaultValue={get("q")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value);
            }
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Select
          label="Dimension"
          value={get("dimension")}
          onChange={(e) => update("dimension", e.target.value)}
          placeholder="All sizes"
          options={COMMON_DIMENSIONS.map((d) => ({ value: d, label: d }))}
        />

        <Select
          label="Length"
          value={get("length")}
          onChange={(e) => update("length", e.target.value)}
          placeholder="All lengths"
          options={COMMON_LENGTHS.map((l) => ({ value: String(l), label: `${l} ft` }))}
        />

        <Select
          label="Species"
          value={get("species")}
          onChange={(e) => update("species", e.target.value)}
          placeholder="All species"
          options={SPECIES_OPTIONS.map((s) => ({ value: s, label: s }))}
        />

        <Select
          label="Grade"
          value={get("grade")}
          onChange={(e) => update("grade", e.target.value)}
          placeholder="All grades"
          options={GRADE_OPTIONS.map((g) => ({ value: g, label: g }))}
        />

        <Select
          label="Treatment"
          value={get("treatment")}
          onChange={(e) => update("treatment", e.target.value)}
          placeholder="All"
          options={TREATMENT_OPTIONS.map((t) => ({
            value: t,
            label: t === "none" ? "Untreated" : t.charAt(0).toUpperCase() + t.slice(1),
          }))}
        />

        <Select
          label="Category"
          value={get("category")}
          onChange={(e) => update("category", e.target.value)}
          placeholder="All"
          options={CATEGORY_OPTIONS.map((c) => ({
            value: c,
            label: c.charAt(0).toUpperCase() + c.slice(1),
          }))}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-32">
          <Input
            label="Zip Code"
            placeholder="80202"
            defaultValue={get("zip")}
            maxLength={5}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                update("zip", (e.target as HTMLInputElement).value);
              }
            }}
            onBlur={(e) => update("zip", e.target.value)}
          />
        </div>

        <div className="w-48">
          <Slider
            label="Radius"
            value={Number(get("radius")) || 25}
            onChange={(v) => update("radius", String(v))}
            min={5}
            max={100}
            step={5}
            suffix=" mi"
          />
        </div>

        <Select
          label="Sort by"
          value={get("sort") || "price"}
          onChange={(e) => update("sort", e.target.value)}
          options={[
            { value: "price", label: "Price: Low to High" },
            { value: "distance", label: "Distance: Nearest" },
            { value: "value", label: "Best Value" },
          ]}
          className="w-44"
        />

        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>
    </div>
  );
}
