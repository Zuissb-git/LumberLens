import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeRepriceResult } from "@/lib/utils/repricing";
import { formatCurrency } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "csv";

  if (format !== "csv") {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  const order = await prisma.buildOrder.findFirst({
    where: { id, userId: session.user.id },
    include: {
      lineItems: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reprice = await computeRepriceResult(order);

  // Build CSV
  const rows: string[] = [];
  rows.push("Product,Quantity (incl. waste),Best Vendor,Best Price,Line Total");

  for (const item of reprice.perItemBest) {
    rows.push(
      [
        `"${item.productName}"`,
        item.quantity,
        `"${item.bestVendorName}"`,
        formatCurrency(item.bestPriceCents / item.quantity),
        formatCurrency(item.bestPriceCents),
      ].join(",")
    );
  }

  rows.push("");
  rows.push(`Split Order Total,,,,${formatCurrency(reprice.splitOrderTotalCents)}`);
  rows.push(`Best Single Vendor Total,,,,${formatCurrency(reprice.bestSingleVendorTotalCents)}`);
  rows.push(`Potential Savings,,,,${formatCurrency(reprice.splitSavingsCents)}`);

  const csv = rows.join("\n");
  const filename = `${order.name.replace(/[^a-zA-Z0-9]/g, "_")}_export.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
