"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
  chain: string | null;
}

export default function SubmitPricePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [productId, setProductId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("piece");
  const [inStock, setInStock] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/vendors").then((r) => r.json()),
    ]).then(([p, v]) => {
      setProducts(p);
      setVendors(v);
    });
  }, []);

  const filteredProducts = productSearch
    ? products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      )
    : products;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    const priceCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError("Please enter a valid price");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        vendorId,
        priceCents,
        priceUnit,
        inStock,
        notes: notes || undefined,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setProductId("");
      setVendorId("");
      setPrice("");
      setNotes("");
      setProductSearch("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-700" />
            Submit a Price Sighting
          </CardTitle>
          <CardDescription>
            Help the community by reporting lumber prices you&apos;ve seen. Submissions are
            labeled as <Badge variant="warning">Unverified</Badge> and expire after 14 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              <CheckCircle className="h-4 w-4" />
              Price submitted successfully! Thank you for contributing.
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product search */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Product
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 mb-1"
              />
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                size={5}
              >
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <Select
              label="Vendor / Store"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="Select a store..."
              options={vendors.map((v) => ({
                value: v.id,
                label: `${v.name}${v.chain ? ` (${v.chain})` : ""}`,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="price"
                label="Price ($)"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5.98"
                required
              />

              <Select
                label="Price Unit"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                options={[
                  { value: "piece", label: "Per Piece" },
                  { value: "board_foot", label: "Per Board Foot" },
                  { value: "linear_foot", label: "Per Linear Foot" },
                ]}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="inStock"
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded border-stone-300 text-green-700 focus:ring-green-600"
              />
              <label htmlFor="inStock" className="text-sm text-stone-700">
                Item was in stock
              </label>
            </div>

            <Input
              id="notes"
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Sale price, clearance, etc."
            />

            <Button type="submit" disabled={submitting || !productId || !vendorId} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Price"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
