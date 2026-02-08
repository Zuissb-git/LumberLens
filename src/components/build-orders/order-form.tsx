"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface LineItem {
  productId: string;
  quantity: number;
}

interface OrderFormProps {
  initialData?: {
    name: string;
    notes: string;
    wasteFactor: number;
    lineItems: LineItem[];
  };
  orderId?: string;
}

export function OrderForm({ initialData, orderId }: OrderFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState(initialData?.name ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [wasteFactor, setWasteFactor] = useState(initialData?.wasteFactor ?? 0.1);
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems ?? [{ productId: "", quantity: 1 }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: "", quantity: 1 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const validItems = lineItems.filter((li) => li.productId);
    if (validItems.length === 0) {
      setError("Add at least one item");
      setSaving(false);
      return;
    }

    const payload = { name, notes, wasteFactor, lineItems: validItems };
    const url = orderId ? `/api/build-orders/${orderId}` : "/api/build-orders";
    const method = orderId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    const order = await res.json();
    router.push(`/build-orders/${order.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{orderId ? "Edit Build Order" : "New Build Order"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Order Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Backyard Deck"
              required
            />

            <div>
              <Slider
                label="Waste Factor"
                value={Math.round(wasteFactor * 100)}
                onChange={(v) => setWasteFactor(v / 100)}
                min={0}
                max={25}
                step={1}
                suffix="%"
              />
            </div>
          </div>

          <Input
            id="notes"
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this order..."
          />

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-stone-900">Line Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    value={item.productId}
                    onChange={(e) => updateLineItem(index, "productId", e.target.value)}
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(index, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-20 px-3 py-2 border border-stone-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Qty"
                  />

                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    disabled={lineItems.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {orderId ? "Update Order" : "Create Order"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
