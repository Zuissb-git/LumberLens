import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreateBuildOrderSchema } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.buildOrder.findMany({
    where: { userId: session.user.id },
    include: {
      lineItems: {
        include: { product: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateBuildOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, notes, wasteFactor, lineItems } = parsed.data;

  const order = await prisma.buildOrder.create({
    data: {
      userId: session.user.id,
      name,
      notes,
      wasteFactor,
      lineItems: {
        create: lineItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      lineItems: { include: { product: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
