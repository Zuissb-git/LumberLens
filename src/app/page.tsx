"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, Calculator, DollarSign, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 via-green-900 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Find the best lumber prices
              <span className="text-green-400"> near you</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mt-4 max-w-2xl">
              Compare prices across Home Depot, Lowe&apos;s, Menards, local lumber yards, and more.
              Build smarter. Save more.
            </p>

            {/* Quick search */}
            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search lumber (e.g., "2x4 cedar 8ft")'
                  className="w-full pl-11 pr-4 py-3 rounded-lg text-stone-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-500">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-2 mt-4">
              {["2x4", "2x6", "4x4", "Cedar", "Pressure Treated"].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-white/10 text-sm text-green-100 hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-stone-900 text-center mb-10">
          Everything you need to save on lumber
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-green-700" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Price Comparison</h3>
              <p className="text-sm text-stone-500">
                Search and compare lumber prices across multiple vendors, sorted by price, distance, or value.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Build Orders</h3>
              <p className="text-sm text-stone-500">
                Create reusable material lists and instantly see which vendor offers the best total price.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="h-5 w-5 text-amber-700" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Project Templates</h3>
              <p className="text-sm text-stone-500">
                Deck and fence calculators generate complete material lists with configurable waste factors.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-5 w-5 text-purple-700" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Crowdsourced Prices</h3>
              <p className="text-sm text-stone-500">
                Submit prices you see in stores to help the community get accurate, up-to-date data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">
            Ready to save on your next project?
          </h2>
          <p className="text-stone-500 mb-6 max-w-xl mx-auto">
            Join thousands of contractors and DIYers who use LumberLens to find the best lumber prices.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/search">
              <Button size="lg">
                Start Searching
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
