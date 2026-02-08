import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeRepriceResult } from "@/lib/utils/repricing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const order = await prisma.buildOrder.findFirst({
    where: { shareToken: token },
    include: {
      lineItems: { include: { product: true } },
      user: { select: { name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reprice = await computeRepriceResult(order);

  return NextResponse.json({
    name: order.name,
    notes: order.notes,
    wasteFactor: order.wasteFactor,
    ownerName: order.user.name,
    lineItems: order.lineItems.map((li) => ({
      id: li.id,
      quantity: li.quantity,
      product: {
        id: li.product.id,
        name: li.product.name,
        species: li.product.species,
        boardFeet: li.product.boardFeet,
      },
    })),
    reprice,
  });
}
