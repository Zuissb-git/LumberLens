import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      chain: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
    },
  });

  return NextResponse.json(vendors);
}
