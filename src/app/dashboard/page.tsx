"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PriceTrends } from "@/components/dashboard/price-trends";
import { FavoritesPreview } from "@/components/dashboard/favorites-preview";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { Package, Plus, Search, DollarSign, Loader2 } from "lucide-react";
import type { FavoriteWithPrice } from "@/types";

interface DashboardData {
  stats: {
    tier: string;
    buildOrderCount: number;
    pricesSubmittedCount: number;
    totalSavingsCents: number;
    activeAlerts: number;
    triggeredAlerts: number;
  };
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    linkHref: string;
  }[];
  priceTrends: {
    productName: string;
    currentAvgCents: number;
    thirtyDayAgoAvgCents: number;
    trendDirection: string;
    changePercent: number;
  }[];
  favorites: FavoriteWithPrice[];
  recentOrders: {
    id: string;
    name: string;
    lineItemCount: number;
    lastRepriced: string | null;
    updatedAt: string;
  }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-1">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Stats */}
      {data && <StatsGrid stats={data.stats} />}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-8">
        <Link href="/search">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Search className="h-5 w-5 text-stone-400" />
              <span className="font-medium text-stone-700">Search Prices</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/build-orders/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Plus className="h-5 w-5 text-stone-400" />
              <span className="font-medium text-stone-700">New Build Order</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/submit-price">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-stone-400" />
              <span className="font-medium text-stone-700">Submit a Price</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Two-column layout for main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {data && <ActivityFeed activities={data.recentActivity} />}
          {data && <PriceTrends trends={data.priceTrends} />}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Build Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Build Orders</CardTitle>
              <Link href="/build-orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!data || data.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-500 text-sm">No build orders yet</p>
                  <Link href="/build-orders/new">
                    <Button variant="outline" size="sm" className="mt-3">
                      Create your first order
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {data.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/build-orders/${order.id}`}
                      className="block py-3 hover:bg-stone-50 -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-stone-900">{order.name}</p>
                          <p className="text-xs text-stone-500">
                            {order.lineItemCount} items
                            {order.lastRepriced && (
                              <> &middot; Repriced {new Date(order.lastRepriced).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                        <Badge variant="outline">View</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {data && <FavoritesPreview favorites={data.favorites} />}
          {data && (
            <AlertsPanel
              activeAlerts={data.stats.activeAlerts}
              triggeredAlerts={data.stats.triggeredAlerts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
