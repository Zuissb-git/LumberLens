import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function calcBoardFeet(w: number, d: number, l: number) {
  return (w * d * l) / 12;
}

// Actual dimensions from nominal
const ACTUAL: Record<number, number> = {
  1: 0.75,
  2: 1.5,
  4: 3.5,
  6: 5.5,
  8: 7.25,
  10: 9.25,
  12: 11.25,
};

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.buildOrderLineItem.deleteMany();
  await prisma.buildOrder.deleteMany();
  await prisma.priceListing.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // ─── Demo User ───────────────────────────────────────────
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@lumberlens.com",
      hashedPassword: await hash("password123", 12),
      tier: "pro",
      zipCode: "80202",
    },
  });
  console.log("Created demo user:", demoUser.email);

  // ─── Vendors ─────────────────────────────────────────────
  const vendorData = [
    // Denver metro (10 vendors)
    { name: "Home Depot - Denver Central", chain: "Home Depot", address: "2000 W Colfax Ave", city: "Denver", state: "CO", zipCode: "80204", lat: 39.7397, lng: -105.0208 },
    { name: "Home Depot - Aurora", chain: "Home Depot", address: "14200 E Alameda Ave", city: "Aurora", state: "CO", zipCode: "80012", lat: 39.7029, lng: -104.7988 },
    { name: "Home Depot - Lakewood", chain: "Home Depot", address: "8000 W Colfax Ave", city: "Lakewood", state: "CO", zipCode: "80214", lat: 39.7397, lng: -105.0808 },
    { name: "Lowe's - Denver", chain: "Lowe's", address: "2501 S Colorado Blvd", city: "Denver", state: "CO", zipCode: "80222", lat: 39.6720, lng: -104.9407 },
    { name: "Lowe's - Westminster", chain: "Lowe's", address: "9400 Sheridan Blvd", city: "Westminster", state: "CO", zipCode: "80031", lat: 39.8375, lng: -105.0536 },
    { name: "Lowe's - Littleton", chain: "Lowe's", address: "7900 W Quincy Ave", city: "Littleton", state: "CO", zipCode: "80123", lat: 39.6334, lng: -105.0763 },
    { name: "Boulder Lumber Co.", chain: null, address: "4800 Broadway", city: "Boulder", state: "CO", zipCode: "80304", lat: 40.0358, lng: -105.2522 },
    { name: "Front Range Timber", chain: null, address: "1200 W 38th Ave", city: "Denver", state: "CO", zipCode: "80211", lat: 39.7680, lng: -105.0125 },
    { name: "Menards - Thornton", chain: "Menards", address: "9500 Grant St", city: "Thornton", state: "CO", zipCode: "80229", lat: 39.8530, lng: -104.9798 },
    { name: "84 Lumber - Commerce City", chain: "84 Lumber", address: "6000 E 56th Ave", city: "Commerce City", state: "CO", zipCode: "80022", lat: 39.8090, lng: -104.9032 },
    // Chicago metro (3 vendors)
    { name: "Home Depot - Chicago Loop", chain: "Home Depot", address: "1232 S Clinton St", city: "Chicago", state: "IL", zipCode: "60607", lat: 41.8654, lng: -87.6412 },
    { name: "Lowe's - Chicago Lincoln Park", chain: "Lowe's", address: "2500 N Clybourn Ave", city: "Chicago", state: "IL", zipCode: "60614", lat: 41.9270, lng: -87.6648 },
    { name: "Windy City Lumber", chain: null, address: "4100 W Grand Ave", city: "Chicago", state: "IL", zipCode: "60651", lat: 41.8910, lng: -87.7290 },
    // Phoenix metro (3 vendors)
    { name: "Home Depot - Phoenix Central", chain: "Home Depot", address: "1740 W Northern Ave", city: "Phoenix", state: "AZ", zipCode: "85021", lat: 33.5520, lng: -112.0960 },
    { name: "Lowe's - Phoenix Camelback", chain: "Lowe's", address: "2640 E Camelback Rd", city: "Phoenix", state: "AZ", zipCode: "85016", lat: 33.5091, lng: -112.0153 },
    { name: "Desert Pine Lumber", chain: null, address: "3020 E Washington St", city: "Phoenix", state: "AZ", zipCode: "85034", lat: 33.4410, lng: -112.0180 },
  ];

  const vendors = await Promise.all(
    vendorData.map((v) => prisma.vendor.create({ data: v }))
  );
  console.log(`Created ${vendors.length} vendors`);

  // ─── Products ────────────────────────────────────────────
  const dimensions: [number, number, number[], string][] = [
    // [width, depth, lengths, category]
    [2, 4, [8, 10, 12, 16], "dimensional"],
    [2, 6, [8, 10, 12, 16], "dimensional"],
    [2, 8, [8, 10, 12, 16], "dimensional"],
    [2, 10, [8, 12, 16], "dimensional"],
    [2, 12, [8, 12, 16], "dimensional"],
    [4, 4, [8, 10, 12], "post"],
    [4, 6, [8, 12], "beam"],
    [6, 6, [8, 10, 12], "post"],
  ];

  const speciesConfigs = [
    { species: "SPF", grade: "#2", treatment: "none" },
    { species: "SPF", grade: "#2", treatment: "pressure-treated" },
    { species: "Cedar", grade: "Select", treatment: "none" },
    { species: "Douglas Fir", grade: "#1", treatment: "none" },
    { species: "SPF", grade: "#2", treatment: "kiln-dried" },
  ];

  // Decking products
  const deckingProducts = [
    { w: 2, d: 6, l: 8, species: "Cedar", grade: "Premium", treatment: "none", category: "decking" as const },
    { w: 2, d: 6, l: 12, species: "Cedar", grade: "Premium", treatment: "none", category: "decking" as const },
    { w: 2, d: 6, l: 16, species: "Cedar", grade: "Premium", treatment: "none", category: "decking" as const },
    { w: 2, d: 6, l: 8, species: "SPF", grade: "#2", treatment: "pressure-treated", category: "decking" as const },
    { w: 2, d: 6, l: 12, species: "SPF", grade: "#2", treatment: "pressure-treated", category: "decking" as const },
    { w: 2, d: 6, l: 16, species: "SPF", grade: "#2", treatment: "pressure-treated", category: "decking" as const },
  ];

  const products: { id: string; boardFeet: number }[] = [];

  // Standard dimensional lumber
  for (const [w, d, lengths, category] of dimensions) {
    for (const l of lengths) {
      for (const sc of speciesConfigs) {
        // Skip some combinations to keep it reasonable
        if (sc.species === "Cedar" && w > 4 && d > 4) continue;
        if (sc.species === "Douglas Fir" && category === "post" && w < 6) continue;

        const bf = calcBoardFeet(w, d, l);
        const name = `${w}x${d}x${l}' ${sc.species} ${sc.grade}${sc.treatment !== "none" ? ` (${sc.treatment})` : ""}`;

        const product = await prisma.product.create({
          data: {
            name,
            species: sc.species,
            grade: sc.grade,
            treatment: sc.treatment,
            nominalWidth: w,
            nominalDepth: d,
            actualWidth: ACTUAL[w] ?? w - 0.5,
            actualDepth: ACTUAL[d] ?? d - 0.5,
            lengthFt: l,
            boardFeet: bf,
            category,
          },
        });
        products.push({ id: product.id, boardFeet: bf });
      }
    }
  }

  // Decking
  for (const dp of deckingProducts) {
    const bf = calcBoardFeet(dp.w, dp.d, dp.l);
    const name = `${dp.w}x${dp.d}x${dp.l}' ${dp.species} ${dp.grade}${dp.treatment !== "none" ? ` (${dp.treatment})` : ""}`;

    const product = await prisma.product.create({
      data: {
        name,
        species: dp.species,
        grade: dp.grade,
        treatment: dp.treatment,
        nominalWidth: dp.w,
        nominalDepth: dp.d,
        actualWidth: ACTUAL[dp.w] ?? dp.w - 0.5,
        actualDepth: ACTUAL[dp.d] ?? dp.d - 0.5,
        lengthFt: dp.l,
        boardFeet: bf,
        category: dp.category,
      },
    });
    products.push({ id: product.id, boardFeet: bf });
  }

  console.log(`Created ${products.length} products`);

  // ─── Price Listings ──────────────────────────────────────
  // Base prices in cents per board foot, by species/treatment
  const basePricePerBf: Record<string, number> = {
    "SPF-none": 75,
    "SPF-pressure-treated": 110,
    "SPF-kiln-dried": 90,
    "Cedar-none": 180,
    "Douglas Fir-none": 120,
  };

  let listingCount = 0;

  for (const product of products) {
    const prod = await prisma.product.findUnique({ where: { id: product.id } });
    if (!prod) continue;

    const key = `${prod.species}-${prod.treatment}`;
    const basePerBf = basePricePerBf[key] ?? 100;

    // Each vendor gets a listing with price variation
    for (const vendor of vendors) {
      // 70% chance this vendor stocks this product
      if (Math.random() > 0.7) continue;

      // Regional price multiplier (different cost of living)
      let regionMultiplier = 1.0;
      if (vendor.state === "IL") regionMultiplier = 1.08; // Chicago slightly higher
      else if (vendor.state === "AZ") regionMultiplier = 0.95; // Phoenix slightly lower

      // Chain-specific markup
      let chainMultiplier = 1.0;
      if (vendor.chain === "Home Depot") chainMultiplier = 1.0 + (Math.random() * 0.1);
      else if (vendor.chain === "Lowe's") chainMultiplier = 0.98 + (Math.random() * 0.12);
      else if (vendor.chain === "Menards") chainMultiplier = 0.92 + (Math.random() * 0.1);
      else if (vendor.chain === "84 Lumber") chainMultiplier = 0.88 + (Math.random() * 0.12);
      else chainMultiplier = 0.85 + (Math.random() * 0.15); // Independent yards often cheaper per BF

      const pricePerBf = Math.round(basePerBf * chainMultiplier * regionMultiplier);
      const priceCents = Math.round(pricePerBf * prod.boardFeet);
      const inStock = Math.random() > 0.05; // 95% in stock

      await prisma.priceListing.create({
        data: {
          productId: prod.id,
          vendorId: vendor.id,
          priceCents,
          priceUnit: "piece",
          pricePerBfCents: pricePerBf,
          inStock,
          confidence: 1.0,
          source: "seed",
        },
      });
      listingCount++;
    }
  }
  console.log(`Created ${listingCount} price listings`);

  // ─── Demo Build Order ────────────────────────────────────
  const sampleProducts = await prisma.product.findMany({
    where: { nominalWidth: 2, nominalDepth: 4, lengthFt: 8, species: "SPF", treatment: "none" },
    take: 1,
  });
  const sampleProducts2 = await prisma.product.findMany({
    where: { nominalWidth: 2, nominalDepth: 6, lengthFt: 12, species: "SPF", treatment: "pressure-treated" },
    take: 1,
  });
  const sampleProducts3 = await prisma.product.findMany({
    where: { nominalWidth: 4, nominalDepth: 4, lengthFt: 8, species: "SPF", treatment: "pressure-treated" },
    take: 1,
  });

  if (sampleProducts[0] && sampleProducts2[0] && sampleProducts3[0]) {
    await prisma.buildOrder.create({
      data: {
        userId: demoUser.id,
        name: "Backyard Deck Project",
        notes: "12x16 deck with stairs",
        wasteFactor: 0.1,
        lineItems: {
          create: [
            { productId: sampleProducts[0].id, quantity: 24 },
            { productId: sampleProducts2[0].id, quantity: 16 },
            { productId: sampleProducts3[0].id, quantity: 8 },
          ],
        },
      },
    });
    console.log("Created demo build order");
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
