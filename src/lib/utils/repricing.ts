import { prisma } from "@/lib/db";
import type { RepriceResult, VendorTotal } from "@/types";

interface OrderWithLineItems {
  id: string;
  wasteFactor: number;
  lineItems: {
    productId: string;
    quantity: number;
    product: { name: string };
  }[];
}

export async function computeRepriceResult(order: OrderWithLineItems): Promise<RepriceResult> {
  const productIds = order.lineItems.map((li) => li.productId);

  const listings = await prisma.priceListing.findMany({
    where: {
      productId: { in: productIds },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
    include: { vendor: true },
  });

  // Group listings by vendor
  const vendorListings = new Map<string, typeof listings>();
  for (const listing of listings) {
    const existing = vendorListings.get(listing.vendorId) ?? [];
    existing.push(listing);
    vendorListings.set(listing.vendorId, existing);
  }

  // Calculate total cost per vendor
  const vendorTotals: VendorTotal[] = [];

  for (const [vendorId, vListings] of vendorListings) {
    const vendor = vListings[0].vendor;
    let totalCents = 0;
    let itemCount = 0;
    const missingItems: string[] = [];

    for (const lineItem of order.lineItems) {
      const listing = vListings.find(
        (l) => l.productId === lineItem.productId && l.inStock
      );
      if (listing) {
        const qty = Math.ceil(lineItem.quantity * (1 + order.wasteFactor));
        totalCents += listing.priceCents * qty;
        itemCount++;
      } else {
        missingItems.push(lineItem.product.name);
      }
    }

    vendorTotals.push({
      vendorId,
      vendorName: vendor.name,
      vendorChain: vendor.chain,
      totalCents,
      itemCount,
      missingItems,
      distance: null,
    });
  }

  vendorTotals.sort((a, b) => {
    const aMissing = a.missingItems.length;
    const bMissing = b.missingItems.length;
    if (aMissing !== bMissing) return aMissing - bMissing;
    return a.totalCents - b.totalCents;
  });

  // Per-item cheapest vendor
  const perItemBest = order.lineItems.map((lineItem) => {
    const qty = Math.ceil(lineItem.quantity * (1 + order.wasteFactor));
    let bestPrice = Infinity;
    let bestVendorId = "";
    let bestVendorName = "";

    for (const listing of listings) {
      if (listing.productId === lineItem.productId && listing.inStock) {
        const cost = listing.priceCents * qty;
        if (cost < bestPrice) {
          bestPrice = cost;
          bestVendorId = listing.vendorId;
          bestVendorName = listing.vendor.name;
        }
      }
    }

    return {
      productId: lineItem.productId,
      productName: lineItem.product.name,
      quantity: qty,
      bestVendorId,
      bestVendorName,
      bestPriceCents: bestPrice === Infinity ? 0 : bestPrice,
    };
  });

  const splitOrderTotalCents = perItemBest.reduce(
    (sum, item) => sum + item.bestPriceCents,
    0
  );

  const bestSingleVendor = vendorTotals.find(
    (v) => v.missingItems.length === 0
  );
  const bestSingleVendorTotalCents = bestSingleVendor?.totalCents ?? 0;

  const splitSavingsCents = bestSingleVendorTotalCents - splitOrderTotalCents;

  return {
    vendorTotals,
    perItemBest,
    splitOrderTotalCents,
    bestSingleVendorTotalCents,
    splitSavingsCents,
  };
}
