import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SearchParamsSchema, type SearchResult, type LocationInfo } from "@/types";
import { haversineDistance, getBoundingBox, zipToCoords } from "@/lib/utils/geo";
import { parseDimension } from "@/lib/utils/lumber";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams;
  const parsed = SearchParamsSchema.safeParse(Object.fromEntries(url.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search params" }, { status: 400 });
  }

  const params = parsed.data;

  // Build product filter
  const productWhere: Record<string, unknown> = {};

  if (params.q) {
    productWhere.name = { contains: params.q };
  }

  if (params.dimension) {
    const dim = parseDimension(params.dimension);
    if (dim) {
      productWhere.nominalWidth = dim.width;
      productWhere.nominalDepth = dim.depth;
    }
  }

  if (params.length) {
    productWhere.lengthFt = params.length;
  }

  if (params.species) {
    productWhere.species = params.species;
  }

  if (params.grade) {
    productWhere.grade = params.grade;
  }

  if (params.treatment) {
    productWhere.treatment = params.treatment;
  }

  if (params.category) {
    productWhere.category = params.category;
  }

  // Resolve user coordinates
  const radius = params.radius;
  const coords = params.zip ? zipToCoords(params.zip) : null;
  const useGeoFilter = coords !== null;

  const locationInfo: LocationInfo = {
    resolved: useGeoFilter,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    radiusMiles: radius,
    zipProvided: params.zip ?? null,
  };

  // Build vendor filter — only apply bounding box when we have valid coords
  const vendorWhere: Record<string, unknown> | undefined = useGeoFilter
    ? (() => {
        const bbox = getBoundingBox(coords.lat, coords.lng, radius);
        return {
          lat: { gte: bbox.minLat, lte: bbox.maxLat },
          lng: { gte: bbox.minLng, lte: bbox.maxLng },
        };
      })()
    : undefined;

  // Query price listings with product and vendor data
  const listings = await prisma.priceListing.findMany({
    where: {
      product: Object.keys(productWhere).length > 0 ? productWhere : undefined,
      vendor: vendorWhere,
      // Exclude expired user-submitted prices
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
    include: {
      product: true,
      vendor: true,
    },
    take: 200,
  });

  // Compute exact distances and filter
  const results: SearchResult[] = [];
  for (const listing of listings) {
    let distance: number | null = null;

    if (useGeoFilter) {
      distance = haversineDistance(
        coords.lat,
        coords.lng,
        listing.vendor.lat,
        listing.vendor.lng
      );
      if (distance > radius) continue;
      distance = Math.round(distance * 10) / 10;
    }

    results.push({
      listingId: listing.id,
      productId: listing.product.id,
      productName: listing.product.name,
      species: listing.product.species,
      grade: listing.product.grade,
      treatment: listing.product.treatment,
      nominalWidth: listing.product.nominalWidth,
      nominalDepth: listing.product.nominalDepth,
      lengthFt: listing.product.lengthFt,
      boardFeet: listing.product.boardFeet,
      category: listing.product.category,
      vendorId: listing.vendor.id,
      vendorName: listing.vendor.name,
      vendorChain: listing.vendor.chain,
      distance,
      priceCents: listing.priceCents,
      priceUnit: listing.priceUnit,
      pricePerBfCents: listing.pricePerBfCents,
      inStock: listing.inStock,
      confidence: listing.confidence,
      source: listing.source,
    });
  }

  // Sort
  switch (params.sort) {
    case "price":
      results.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "distance":
      results.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
      break;
    case "value":
      results.sort((a, b) => {
        const scoreA = a.priceCents * 0.7 + (a.distance ?? 25) * 100 * 0.3;
        const scoreB = b.priceCents * 0.7 + (b.distance ?? 25) * 100 * 0.3;
        return scoreA - scoreB;
      });
      break;
  }

  // Paginate
  const pageSize = 20;
  const page = params.page;
  const start = (page - 1) * pageSize;
  const paged = results.slice(start, start + pageSize);

  return NextResponse.json({
    results: paged,
    total: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
    locationInfo,
  });
}
