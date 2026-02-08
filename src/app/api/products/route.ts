import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: [
      { nominalWidth: "asc" },
      { nominalDepth: "asc" },
      { lengthFt: "asc" },
      { species: "asc" },
    ],
    select: {
      id: true,
      name: true,
      species: true,
      grade: true,
      treatment: true,
      nominalWidth: true,
      nominalDepth: true,
      lengthFt: true,
      boardFeet: true,
      category: true,
    },
  });

  return NextResponse.json(products);
}
