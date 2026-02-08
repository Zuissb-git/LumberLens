import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ToggleFavoriteSchema } from "@/types";
import type { FavoriteWithPrice } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          priceListings: {
            where: {
              inStock: true,
              OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
              ],
            },
            orderBy: { priceCents: "asc" },
            take: 1,
            include: { vendor: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result: FavoriteWithPrice[] = favorites.map((f) => {
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

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ToggleFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const favorite = await prisma.favorite.create({
    data: {
      userId: session.user.id,
      productId: parsed.data.productId,
    },
  });

  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ToggleFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: {
      userId: session.user.id,
      productId: parsed.data.productId,
    },
  });

  return NextResponse.json({ success: true });
}
