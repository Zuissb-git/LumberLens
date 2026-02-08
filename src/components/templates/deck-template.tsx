"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Hammer, ShoppingCart, Loader2 } from "lucide-react";
import type { TemplateLineItem } from "@/types";

function generateDeckItems(
  widthFt: number,
  lengthFt: number,
  railType: string,
  stairCount: number,
  species: string,
  wasteFactor: number
): TemplateLineItem[] {
  const items: TemplateLineItem[] = [];
  const treatment = species === "Cedar" ? "none" : "pressure-treated";

  // Joists: 2x8 at 16" OC along the length
  const joistCount = Math.ceil((widthFt * 12) / 16) + 1;
  const joistLength = lengthFt <= 12 ? 12 : 16;
  items.push({
    label: `Joists (2x8x${joistLength}')`,
    quantity: Math.ceil(joistCount * (1 + wasteFactor)),
    productQuery: {
      nominalWidth: 2,
      nominalDepth: 8,
      lengthFt: joistLength,
      species,
      treatment,
      category: "dimensional",
    },
  });

  // Rim joists: 2x8 along the perimeter
  const rimCount = Math.ceil((2 * (widthFt + lengthFt)) / joistLength);
  items.push({
    label: `Rim joists (2x8x${joistLength}')`,
    quantity: Math.ceil(rimCount * (1 + wasteFactor)),
    productQuery: {
      nominalWidth: 2,
      nominalDepth: 8,
      lengthFt: joistLength,
      species,
      treatment,
      category: "dimensional",
    },
  });

  // Decking boards: 2x6 perpendicular to joists
  const deckArea = widthFt * lengthFt;
  const boardCoverage = 0.5 * 12; // 5.5" actual width per 12" = ~0.46 ft, but using 6" nominal
  const deckBoardCount = Math.ceil(deckArea / (boardCoverage / 12));
  const deckBoardLength = widthFt <= 12 ? 12 : 16;
  items.push({
    label: `Decking (2x6x${deckBoardLength}')`,
    quantity: Math.ceil(deckBoardCount * (1 + wasteFactor)),
    productQuery: {
      nominalWidth: 2,
      nominalDepth: 6,
      lengthFt: deckBoardLength,
      species,
      treatment,
      category: "decking",
    },
  });

  // Posts: 4x4x8 — one every 6 feet of perimeter + corners
  const postCount = Math.ceil((2 * (widthFt + lengthFt)) / 6);
  items.push({
    label: "Support posts (4x4x8')",
    quantity: Math.ceil(postCount * (1 + wasteFactor)),
    productQuery: {
      nominalWidth: 4,
      nominalDepth: 4,
      lengthFt: 8,
      species,
      treatment,
      category: "post",
    },
  });

  // Railing posts (if railing)
  if (railType !== "none") {
    const perimeterFt = 2 * widthFt + lengthFt; // 3 sides
    const railPostCount = Math.ceil(perimeterFt / 6);
    items.push({
      label: "Rail posts (4x4x8')",
      quantity: Math.ceil(railPostCount * (1 + wasteFactor)),
      productQuery: {
        nominalWidth: 4,
        nominalDepth: 4,
        lengthFt: 8,
        species,
        treatment,
        category: "post",
      },
    });

    // Top rails: 2x4
    const railLength = 8;
    const railSections = Math.ceil(perimeterFt / railLength);
    items.push({
      label: `Top rails (2x4x${railLength}')`,
      quantity: Math.ceil(railSections * 2 * (1 + wasteFactor)),
      productQuery: {
        nominalWidth: 2,
        nominalDepth: 4,
        lengthFt: railLength,
        species,
        treatment,
        category: "dimensional",
      },
    });

    // Balusters: 2x4 if standard, one every 4 inches
    if (railType === "baluster") {
      const balusterCount = Math.ceil((perimeterFt * 12) / 4);
      items.push({
        label: "Balusters (2x4x8')",
        quantity: Math.ceil(balusterCount * (1 + wasteFactor)),
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
  }

  // Stairs
  if (stairCount > 0) {
    // 3 stringers per stair
    items.push({
      label: "Stair stringers (2x12x8')",
      quantity: Math.ceil(3 * stairCount * (1 + wasteFactor)),
      productQuery: {
        nominalWidth: 2,
        nominalDepth: 12,
        lengthFt: 8,
        species,
        treatment,
        category: "dimensional",
      },
    });

    // Treads: 2 per step, assume 4 steps per stair
    items.push({
      label: "Stair treads (2x6x8')",
      quantity: Math.ceil(8 * stairCount * (1 + wasteFactor)),
      productQuery: {
        nominalWidth: 2,
        nominalDepth: 6,
        lengthFt: 8,
        species,
        treatment,
        category: "dimensional",
      },
    });
  }

  return items;
}

export function DeckTemplate() {
  const router = useRouter();
  const [width, setWidth] = useState(12);
  const [length, setLength] = useState(16);
  const [railType, setRailType] = useState("baluster");
  const [stairCount, setStairCount] = useState(1);
  const [species, setSpecies] = useState("SPF");
  const [wasteFactor, setWasteFactor] = useState(10);
  const [items, setItems] = useState<TemplateLineItem[] | null>(null);
  const [creating, setCreating] = useState(false);

  function calculate() {
    const result = generateDeckItems(width, length, railType, stairCount, species, wasteFactor / 100);
    setItems(result);
  }

  async function createBuildOrder() {
    if (!items) return;
    setCreating(true);

    // Fetch products to match template items
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
        name: `${width}x${length} Deck`,
        notes: `Generated from deck template. ${species}, ${railType} railing, ${stairCount} stair(s).`,
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
          <Hammer className="h-5 w-5 text-green-700" />
          Deck Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Input
            id="deck-width"
            label="Width (ft)"
            type="number"
            min={4}
            max={40}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <Input
            id="deck-length"
            label="Length (ft)"
            type="number"
            min={4}
            max={40}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
          <Select
            label="Rail Type"
            value={railType}
            onChange={(e) => setRailType(e.target.value)}
            options={[
              { value: "baluster", label: "Baluster" },
              { value: "horizontal", label: "Horizontal" },
              { value: "none", label: "No Railing" },
            ]}
          />
          <Input
            id="stair-count"
            label="Stair Sets"
            type="number"
            min={0}
            max={4}
            value={stairCount}
            onChange={(e) => setStairCount(Number(e.target.value))}
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
