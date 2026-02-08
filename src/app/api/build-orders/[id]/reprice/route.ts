import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeRepriceResult } from "@/lib/utils/repricing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.buildOrder.findFirst({
    where: { id, userId: session.user.id },
    include: {
      lineItems: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await computeRepriceResult(order);

  // Update lastRepriced and save savings
  await prisma.buildOrder.update({
    where: { id },
    data: {
      lastRepriced: new Date(),
      lastSavingsCents: result.splitSavingsCents,
    },
  });

  return NextResponse.json(result);
}
