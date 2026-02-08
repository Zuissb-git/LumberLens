import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDistance(miles: number): string {
  if (miles < 1) return "< 1 mi";
  return `${miles.toFixed(1)} mi`;
}

export function savingsPercent(priceCents: number, highestCents: number): number {
  if (highestCents === 0) return 0;
  return Math.round(((highestCents - priceCents) / highestCents) * 100);
}
