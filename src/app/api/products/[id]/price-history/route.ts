import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const days = parseInt(request.nextUrl.searchParams.get("days") ?? "90", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const listings = await prisma.priceListing.findMany({
    where: {
      productId: id,
      createdAt: { gte: since },
    },
    select: {
      priceCents: true,
      createdAt: true,
      vendor: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by day and compute daily average
  const dailyMap = new Map<string, { total: number; count: number; min: number }>();

  for (const l of listings) {
    const dateKey = l.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey);
    if (existing) {
      existing.total += l.priceCents;
      existing.count++;
      existing.min = Math.min(existing.min, l.priceCents);
    } else {
      dailyMap.set(dateKey, { total: l.priceCents, count: 1, min: l.priceCents });
    }
  }

  const dataPoints = Array.from(dailyMap.entries()).map(([date, { total, count, min }]) => ({
    date,
    avgCents: Math.round(total / count),
    minCents: min,
    count,
  }));

  return NextResponse.json({
    productId: id,
    productName: product.name,
    days,
    dataPoints,
  });
}
