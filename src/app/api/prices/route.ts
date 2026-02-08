import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SubmitPriceSchema } from "@/types";
import { normalizePriceToBoardFoot } from "@/lib/utils/lumber";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SubmitPriceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { productId, vendorId, priceCents, priceUnit, inStock, notes } = parsed.data;

  // Verify product and vendor exist
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  // Compute normalized price per board foot
  const pricePerBfCents = normalizePriceToBoardFoot(priceCents, priceUnit, product.boardFeet);

  // User-submitted prices expire after 14 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const listing = await prisma.priceListing.create({
    data: {
      productId,
      vendorId,
      priceCents,
      priceUnit,
      pricePerBfCents,
      inStock,
      confidence: 0.5,
      source: "user",
      submittedById: session.user.id,
      notes,
      expiresAt,
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
