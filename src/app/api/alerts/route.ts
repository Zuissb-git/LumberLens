import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreateAlertSchema, DeleteAlertSchema } from "@/types";
import type { PriceAlertWithProduct } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
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
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result: PriceAlertWithProduct[] = alerts.map((a) => ({
    id: a.id,
    productId: a.productId,
    productName: a.product.name,
    targetPriceCents: a.targetPriceCents,
    currentLowestCents: a.product.priceListings[0]?.priceCents ?? null,
    isActive: a.isActive,
    triggeredAt: a.triggeredAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const alert = await prisma.priceAlert.create({
    data: {
      userId: session.user.id,
      productId: parsed.data.productId,
      targetPriceCents: parsed.data.targetPriceCents,
    },
  });

  return NextResponse.json(alert, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = DeleteAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.priceAlert.deleteMany({
    where: {
      id: parsed.data.alertId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
