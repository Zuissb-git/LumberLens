/**
 * Calculate board feet: (width_in * depth_in * length_ft) / 12
 */
export function calcBoardFeet(
  nominalWidthIn: number,
  nominalDepthIn: number,
  lengthFt: number
): number {
  return (nominalWidthIn * nominalDepthIn * lengthFt) / 12;
}

/**
 * Normalize a price to price-per-board-foot in cents.
 */
export function normalizePriceToBoardFoot(
  priceCents: number,
  priceUnit: string,
  boardFeet: number
): number {
  if (boardFeet === 0) return 0;
  switch (priceUnit) {
    case "board_foot":
      return priceCents;
    case "piece":
      return Math.round(priceCents / boardFeet);
    case "linear_foot":
      // linear_foot pricing: price is per running foot, boardFeet is for the full piece length
      // not directly convertible without knowing length, so treat as per-piece approximation
      return Math.round(priceCents / boardFeet);
    default:
      return Math.round(priceCents / boardFeet);
  }
}

/**
 * Normalize a price to per-piece in cents.
 */
export function normalizePriceToPerPiece(
  priceCents: number,
  priceUnit: string,
  boardFeet: number
): number {
  switch (priceUnit) {
    case "piece":
      return priceCents;
    case "board_foot":
      return Math.round(priceCents * boardFeet);
    case "linear_foot":
      return priceCents; // approximate
    default:
      return priceCents;
  }
}

/**
 * Format dimension display string: "2x4x8'"
 */
export function formatDimension(
  nominalWidth: number,
  nominalDepth: number,
  lengthFt: number
): string {
  return `${nominalWidth}x${nominalDepth}x${lengthFt}'`;
}

/**
 * Parse a dimension string like "2x4" into width and depth.
 * Returns null if the string doesn't match.
 */
export function parseDimension(dim: string): { width: number; depth: number } | null {
  const match = dim.match(/^(\d+)x(\d+)$/);
  if (!match) return null;
  return { width: Number(match[1]), depth: Number(match[2]) };
}

/**
 * Common lumber dimensions for filters.
 */
export const COMMON_DIMENSIONS = [
  "2x4", "2x6", "2x8", "2x10", "2x12",
  "4x4", "4x6",
  "6x6",
  "1x4", "1x6", "1x8",
  "5/4x6",
];

export const COMMON_LENGTHS = [8, 10, 12, 14, 16, 20];

export const SPECIES_OPTIONS = [
  "SPF",
  "Cedar",
  "Douglas Fir",
  "Redwood",
  "Pine",
  "Hem-Fir",
];

export const GRADE_OPTIONS = ["#1", "#2", "Select", "Premium", "Standard"];

export const TREATMENT_OPTIONS = [
  "none",
  "pressure-treated",
  "kiln-dried",
];

export const CATEGORY_OPTIONS = [
  "dimensional",
  "decking",
  "post",
  "beam",
  "plywood",
  "trim",
];
