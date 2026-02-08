import { z } from "zod/v4";

// ─── Search ───────────────────────────────────────────────
export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  dimension: z.string().optional(),
  length: z.coerce.number().optional(),
  species: z.string().optional(),
  grade: z.string().optional(),
  treatment: z.string().optional(),
  category: z.string().optional(),
  zip: z.string().regex(/^\d{5}$/).optional(),
  radius: z.coerce.number().default(25),
  sort: z.enum(["price", "distance", "value"]).default("price"),
  page: z.coerce.number().default(1),
});
export type SearchParams = z.infer<typeof SearchParamsSchema>;

// ─── Build Orders ─────────────────────────────────────────
export const LineItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export const CreateBuildOrderSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  notes: z.string().max(500).optional(),
  wasteFactor: z.number().min(0).max(1).default(0.1),
  lineItems: z.array(LineItemSchema).min(1, "At least one item required"),
});
export type CreateBuildOrder = z.infer<typeof CreateBuildOrderSchema>;

export const UpdateBuildOrderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).optional(),
  wasteFactor: z.number().min(0).max(1).optional(),
  lineItems: z.array(LineItemSchema).min(1).optional(),
});
export type UpdateBuildOrder = z.infer<typeof UpdateBuildOrderSchema>;

// ─── Price Submission ─────────────────────────────────────
export const SubmitPriceSchema = z.object({
  productId: z.string(),
  vendorId: z.string(),
  priceCents: z.number().int().min(1),
  priceUnit: z.enum(["piece", "board_foot", "linear_foot"]),
  inStock: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});
export type SubmitPrice = z.infer<typeof SubmitPriceSchema>;

// ─── Auth ─────────────────────────────────────────────────
export const SignUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignUp = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export type SignIn = z.infer<typeof SignInSchema>;

// ─── Shared UI types ──────────────────────────────────────
export interface SearchResult {
  productId: string;
  productName: string;
  species: string;
  grade: string;
  treatment: string;
  nominalWidth: number;
  nominalDepth: number;
  lengthFt: number;
  boardFeet: number;
  category: string;
  vendorId: string;
  vendorName: string;
  vendorChain: string | null;
  distance: number | null;
  priceCents: number;
  priceUnit: string;
  pricePerBfCents: number | null;
  inStock: boolean;
  confidence: number;
  source: string;
  listingId: string;
}

export interface LocationInfo {
  resolved: boolean;
  lat: number | null;
  lng: number | null;
  radiusMiles: number;
  zipProvided: string | null;
}

export interface VendorTotal {
  vendorId: string;
  vendorName: string;
  vendorChain: string | null;
  totalCents: number;
  itemCount: number;
  missingItems: string[];
  distance: number | null;
}

export interface RepriceResult {
  vendorTotals: VendorTotal[];
  perItemBest: {
    productId: string;
    productName: string;
    quantity: number;
    bestVendorId: string;
    bestVendorName: string;
    bestPriceCents: number;
  }[];
  splitOrderTotalCents: number;
  bestSingleVendorTotalCents: number;
  splitSavingsCents: number;
}

export interface TemplateLineItem {
  productQuery: {
    nominalWidth: number;
    nominalDepth: number;
    lengthFt: number;
    species: string;
    treatment: string;
    category: string;
  };
  quantity: number;
  label: string;
}
