import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UpdateBuildOrderSchema } from "@/types";

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

  return NextResponse.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.buildOrder.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = UpdateBuildOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, notes, wasteFactor, lineItems } = parsed.data;

  // If lineItems provided, replace all
  if (lineItems) {
    await prisma.buildOrderLineItem.deleteMany({ where: { buildOrderId: id } });
    await prisma.buildOrderLineItem.createMany({
      data: lineItems.map((item) => ({
        buildOrderId: id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  }

  const order = await prisma.buildOrder.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(notes !== undefined && { notes }),
      ...(wasteFactor !== undefined && { wasteFactor }),
    },
    include: {
      lineItems: { include: { product: true } },
    },
  });

  return NextResponse.json(order);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.buildOrder.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.buildOrder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
