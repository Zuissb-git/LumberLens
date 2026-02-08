import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      priceListings: {
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
        include: {
          vendor: { select: { id: true, name: true, chain: true, city: true, state: true } },
        },
        orderBy: { priceCents: "asc" },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    name: product.name,
    species: product.species,
    grade: product.grade,
    treatment: product.treatment,
    nominalWidth: product.nominalWidth,
    nominalDepth: product.nominalDepth,
    actualWidth: product.actualWidth,
    actualDepth: product.actualDepth,
    lengthFt: product.lengthFt,
    boardFeet: product.boardFeet,
    category: product.category,
    listings: product.priceListings.map((l) => ({
      id: l.id,
      vendorId: l.vendor.id,
      vendorName: l.vendor.name,
      vendorChain: l.vendor.chain,
      vendorLocation: `${l.vendor.city}, ${l.vendor.state}`,
      priceCents: l.priceCents,
      priceUnit: l.priceUnit,
      pricePerBfCents: l.pricePerBfCents,
      inStock: l.inStock,
      confidence: l.confidence,
      source: l.source,
      updatedAt: l.updatedAt.toISOString(),
    })),
  });
}
