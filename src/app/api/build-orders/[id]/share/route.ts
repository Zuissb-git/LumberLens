import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ShareOrderSchema } from "@/types";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();
  const parsed = ShareOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await prisma.buildOrder.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.enabled) {
    const shareToken = order.shareToken ?? generateToken();
    await prisma.buildOrder.update({
      where: { id },
      data: { shareToken },
    });
    return NextResponse.json({ shareToken });
  } else {
    await prisma.buildOrder.update({
      where: { id },
      data: { shareToken: null },
    });
    return NextResponse.json({ shareToken: null });
  }
}
