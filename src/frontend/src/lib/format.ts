import type { Centavos, Timestamp } from "@/types";

/**
 * Format a centavo amount as Philippine Peso, e.g. 15000n -> "₱150.00".
 * Whole-peso amounts drop the decimals for a cleaner menu read.
 */
export function formatPeso(
  centavos: Centavos | number | undefined | null,
): string {
  const value =
    typeof centavos === "bigint" ? Number(centavos) : (centavos ?? 0);
  if (!Number.isFinite(value)) return "₱0";
  const pesos = value / 100;
  const hasCentavos = Math.round(pesos * 100) % 100 !== 0;
  return `₱${pesos.toLocaleString("en-PH", {
    minimumFractionDigits: hasCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Convert a Motoko nanosecond timestamp into a Date, or null when invalid. */
export function timestampToDate(
  timestamp: Timestamp | undefined | null,
): Date | null {
  if (timestamp === undefined || timestamp === null) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Human-readable order date, e.g. "Sep 22, 2026 · 3:40 PM". */
export function formatDateTime(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return `${date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} · ${date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/** Short time only, e.g. "3:40 PM". */
export function formatTime(timestamp: Timestamp | undefined | null): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Turn a camelCase enum value into a readable label, e.g. "readyForPickup" -> "Ready for pickup". */
export function humanize(value: string): string {
  const spaced = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Build a stable, URL-safe line identity from a product and its customization. */
export function buildLineId(
  productId: bigint,
  parts: {
    sizeId?: bigint;
    sugarLevel?: string;
    iceLevel?: string;
    milkOption?: string;
    addOnIds: bigint[];
  },
): string {
  const addOns = [...parts.addOnIds].map(String).sort().join(",");
  return [
    String(productId),
    parts.sizeId !== undefined ? String(parts.sizeId) : "-",
    parts.sugarLevel ?? "-",
    parts.iceLevel ?? "-",
    parts.milkOption ?? "-",
    addOns || "-",
  ].join("|");
}
