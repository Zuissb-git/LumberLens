"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Fence, ShoppingCart, Loader2 } from "lucide-react";
import type { TemplateLineItem } from "@/types";

function generateFenceItems(
  linearFt: number,
  heightFt: number,
  style: string,
  species: string,
  wasteFactor: number
): TemplateLineItem[] {
  const items: TemplateLineItem[] = [];
  const treatment = species === "Cedar" ? "none" : "pressure-treated";

  // Posts: 4x4 every 8 feet, plus end post
  const postCount = Math.ceil(linearFt / 8) + 1;
  const postLength = heightFt <= 6 ? 8 : 10; // need extra for burial
  items.push({
    label: `Posts (4x4x${postLength}')`,
    quantity: Math.ceil(postCount * (1 + wasteFactor)),
    productQuery: {
      nominalWidth: 4,
      nominalDepth: 4,
      lengthFt: postLength,
      species,
      treatment,
      category: "post",
    },
  });

  // Rails: 2x4 top and bottom (privacy) or top/middle/bottom (picket)
  const railsPerSection = style === "picket" ? 3 : 2;
  const sectionCount = Math.ceil(linearFt / 8);
  items.push({
    label: `Rails (2x4x8')`,
    quantity: Math.ceil(sectionCount * railsPerSection * (1 + wasteFactor)),
    productQuery: {
      nominalWidth: 2,
      nominalDepth: 4,
      lengthFt: 8,
      species,
      treatment,
      category: "dimensional",
    },
  });

  if (style === "privacy") {
    // Privacy boards: 1x6 (using 2x6 as stand-in since we don't have 1x in our seed)
    // Boards are butted tight, so one every 5.5" actual
    const boardCount = Math.ceil((linearFt * 12) / 5.5);
    const boardLength = heightFt <= 6 ? 8 : 8; // cut to height
    items.push({
      label: `Privacy boards (2x6x${boardLength}')`,
      quantity: Math.ceil(boardCount * (1 + wasteFactor)),
      productQuery: {
        nominalWidth: 2,
        nominalDepth: 6,
        lengthFt: boardLength,
        species,
        treatment,
        category: "dimensional",
      },
    });
  } else {
    // Picket fence: pickets every 3.5"
    const picketCount = Math.ceil((linearFt * 12) / 3.5);
    items.push({
      label: "Pickets (2x4x8')",
      quantity: Math.ceil(picketCount * (1 + wasteFactor)),
      productQuery: {
        nominalWidth: 2,
        nominalDepth: 4,
        lengthFt: 8,
        species,
        treatment,
        category: "dimensional",
      },
    });
  }

  return items;
}

export function FenceTemplate() {
  const router = useRouter();
  const [linearFt, setLinearFt] = useState(100);
  const [height, setHeight] = useState(6);
  const [style, setStyle] = useState("privacy");
  const [species, setSpecies] = useState("SPF");
  const [wasteFactor, setWasteFactor] = useState(10);
  const [items, setItems] = useState<TemplateLineItem[] | null>(null);
  const [creating, setCreating] = useState(false);

  function calculate() {
    const result = generateFenceItems(linearFt, height, style, species, wasteFactor / 100);
    setItems(result);
  }

  async function createBuildOrder() {
    if (!items) return;
    setCreating(true);

    const res = await fetch("/api/products");
    const products = await res.json();

    const lineItems = items.map((item) => {
      const match = products.find(
        (p: Record<string, unknown>) =>
          p.nominalWidth === item.productQuery.nominalWidth &&
          p.nominalDepth === item.productQuery.nominalDepth &&
          p.lengthFt === item.productQuery.lengthFt &&
          p.species === item.productQuery.species &&
          p.treatment === item.productQuery.treatment
      );
      return {
        productId: match?.id ?? products[0]?.id,
        quantity: item.quantity,
      };
    }).filter((li: { productId: string }) => li.productId);

    const orderRes = await fetch("/api/build-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${linearFt}ft ${style.charAt(0).toUpperCase() + style.slice(1)} Fence`,
        notes: `Generated from fence template. ${linearFt} linear ft, ${height}ft tall, ${species}.`,
        wasteFactor: wasteFactor / 100,
        lineItems,
      }),
    });

    if (orderRes.ok) {
      const order = await orderRes.json();
      router.push(`/build-orders/${order.id}`);
    } else {
      setCreating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fence className="h-5 w-5 text-green-700" />
          Fence Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Input
            id="fence-linear-ft"
            label="Linear Feet"
            type="number"
            min={10}
            max={500}
            value={linearFt}
            onChange={(e) => setLinearFt(Number(e.target.value))}
          />
          <Select
            label="Height"
            value={String(height)}
            onChange={(e) => setHeight(Number(e.target.value))}
            options={[
              { value: "4", label: "4 ft" },
              { value: "6", label: "6 ft" },
              { value: "8", label: "8 ft" },
            ]}
          />
          <Select
            label="Style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            options={[
              { value: "privacy", label: "Privacy" },
              { value: "picket", label: "Picket" },
            ]}
          />
          <Select
            label="Wood Species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            options={[
              { value: "SPF", label: "SPF (Pressure Treated)" },
              { value: "Cedar", label: "Cedar" },
            ]}
          />
          <Slider
            label="Waste Factor"
            value={wasteFactor}
            onChange={setWasteFactor}
            min={0}
            max={25}
            step={1}
            suffix="%"
          />
        </div>

        <Button onClick={calculate}>
          Calculate Materials
        </Button>

        {items && (
          <div className="mt-6">
            <h4 className="font-medium text-stone-900 mb-3">Material List</h4>
            <div className="border rounded-lg divide-y divide-stone-100">
              {items.map((item, i) => (
                <div key={i} className="px-4 py-2 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{item.label}</span>
                  <span className="font-medium text-stone-900">x{item.quantity}</span>
                </div>
              ))}
            </div>

            <Button onClick={createBuildOrder} disabled={creating} className="mt-4">
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create Build Order
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
