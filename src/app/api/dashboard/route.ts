import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FavoriteWithPrice } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch data in parallel
  const [
    user,
    buildOrders,
    pricesSubmittedCount,
    favorites,
    recentListings,
    alertCounts,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }),
    prisma.buildOrder.findMany({
      where: { userId },
      include: { lineItems: { select: { id: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.priceListing.count({ where: { submittedById: userId } }),
    prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            priceListings: {
              where: {
                inStock: true,
                OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
              },
              orderBy: { priceCents: "asc" },
              take: 1,
              include: { vendor: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.priceListing.findMany({
      where: { submittedById: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: { select: { name: true } }, vendor: { select: { name: true } } },
    }),
    prisma.priceAlert.groupBy({
      by: ["isActive"],
      where: { userId },
      _count: true,
    }),
  ]);

  // Total savings from repriced orders
  const totalSavingsCents = buildOrders.reduce(
    (sum, o) => sum + (o.lastSavingsCents ?? 0),
    0
  );

  // Recent activity feed
  const recentActivity: { type: string; description: string; timestamp: string; linkHref: string }[] = [];

  // Add recent build orders
  for (const order of buildOrders.slice(0, 3)) {
    recentActivity.push({
      type: "build_order",
      description: `Created build order "${order.name}"`,
      timestamp: order.createdAt.toISOString(),
      linkHref: `/build-orders/${order.id}`,
    });
  }

  // Add recent price submissions
  for (const listing of recentListings) {
    recentActivity.push({
      type: "price_submission",
      description: `Submitted price for ${listing.product.name} at ${listing.vendor.name}`,
      timestamp: listing.createdAt.toISOString(),
      linkHref: "/submit-price",
    });
  }

  // Sort by timestamp descending
  recentActivity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Price trends: compare avg price of common products now vs 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const commonProducts = await prisma.product.findMany({
    where: { category: "dimensional" },
    take: 5,
    orderBy: { name: "asc" },
  });

  const priceTrends = await Promise.all(
    commonProducts.map(async (product) => {
      const [currentListings, oldListings] = await Promise.all([
        prisma.priceListing.findMany({
          where: {
            productId: product.id,
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
          select: { priceCents: true },
        }),
        prisma.priceListing.findMany({
          where: {
            productId: product.id,
            createdAt: { lte: thirtyDaysAgo },
          },
          select: { priceCents: true },
        }),
      ]);

      const currentAvgCents = currentListings.length > 0
        ? Math.round(currentListings.reduce((s, l) => s + l.priceCents, 0) / currentListings.length)
        : 0;

      const thirtyDayAgoAvgCents = oldListings.length > 0
        ? Math.round(oldListings.reduce((s, l) => s + l.priceCents, 0) / oldListings.length)
        : currentAvgCents;

      const changePercent = thirtyDayAgoAvgCents > 0
        ? Math.round(((currentAvgCents - thirtyDayAgoAvgCents) / thirtyDayAgoAvgCents) * 100)
        : 0;

      return {
        productName: product.name,
        currentAvgCents,
        thirtyDayAgoAvgCents,
        trendDirection: changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat",
        changePercent: Math.abs(changePercent),
      };
    })
  );

  // Map favorites
  const favoritesPreview: FavoriteWithPrice[] = favorites.map((f) => {
    const cheapest = f.product.priceListings[0] ?? null;
    return {
      id: f.id,
      productId: f.productId,
      productName: f.product.name,
      species: f.product.species,
      category: f.product.category,
      lowestPriceCents: cheapest?.priceCents ?? null,
      vendorName: cheapest?.vendor.name ?? null,
      createdAt: f.createdAt.toISOString(),
    };
  });

  // Recent orders
  const recentOrders = buildOrders.slice(0, 5).map((o) => ({
    id: o.id,
    name: o.name,
    lineItemCount: o.lineItems.length,
    lastRepriced: o.lastRepriced?.toISOString() ?? null,
    updatedAt: o.updatedAt.toISOString(),
  }));

  // Alert counts
  const activeAlerts = alertCounts.find((a) => a.isActive)?._count ?? 0;
  const triggeredAlerts = alertCounts.find((a) => !a.isActive)?._count ?? 0;

  return NextResponse.json({
    stats: {
      tier: user?.tier ?? "free",
      buildOrderCount: buildOrders.length,
      pricesSubmittedCount,
      totalSavingsCents,
      activeAlerts,
      triggeredAlerts,
    },
    recentActivity: recentActivity.slice(0, 10),
    priceTrends: priceTrends.filter((t) => t.currentAvgCents > 0),
    favorites: favoritesPreview,
    recentOrders,
  });
}
