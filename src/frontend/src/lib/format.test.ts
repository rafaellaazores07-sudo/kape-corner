import { describe, expect, it } from "vitest";

import {
  buildLineId,
  formatDateTime,
  formatPeso,
  formatTime,
  humanize,
  timestampToDate,
} from "@/lib/format";

describe("formatPeso", () => {
  it("renders whole-peso amounts without decimals", () => {
    expect(formatPeso(15000n)).toBe("₱150");
    expect(formatPeso(0n)).toBe("₱0");
  });

  it("renders centavo amounts with two decimals", () => {
    expect(formatPeso(15050n)).toBe("₱150.50");
    expect(formatPeso(1n)).toBe("₱0.01");
  });

  it("treats missing or invalid input as zero", () => {
    expect(formatPeso(undefined)).toBe("₱0");
    expect(formatPeso(null)).toBe("₱0");
    expect(formatPeso(Number.NaN)).toBe("₱0");
  });
});

describe("timestampToDate", () => {
  it("converts nanosecond timestamps to a Date", () => {
    const date = timestampToDate(1_700_000_000_000_000_000n);
    expect(date?.getTime()).toBe(1_700_000_000_000);
  });

  it("returns null for missing or invalid timestamps", () => {
    expect(timestampToDate(undefined)).toBeNull();
    expect(timestampToDate(null)).toBeNull();
  });
});

describe("formatDateTime / formatTime", () => {
  it("falls back to an em dash when there is no timestamp", () => {
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatTime(null)).toBe("—");
  });

  it("formats a real timestamp into a readable date and time", () => {
    const timestamp = 1_700_000_000_000_000_000n;
    expect(formatDateTime(timestamp)).toContain("2023");
    expect(formatTime(timestamp)).toMatch(/AM|PM/);
  });
});

describe("humanize", () => {
  it("splits camelCase and capitalizes the first word", () => {
    expect(humanize("readyForPickup")).toBe("Ready for pickup");
    expect(humanize("orderReceived")).toBe("Order received");
  });
});

describe("buildLineId", () => {
  it("is stable regardless of add-on ordering", () => {
    const a = buildLineId(1n, { addOnIds: [3n, 1n, 2n] });
    const b = buildLineId(1n, { addOnIds: [1n, 2n, 3n] });
    expect(a).toBe(b);
  });

  it("distinguishes different customizations of the same product", () => {
    const plain = buildLineId(1n, { addOnIds: [] });
    const large = buildLineId(1n, { sizeId: 2n, addOnIds: [] });
    const sweet = buildLineId(1n, { sugarLevel: "50%", addOnIds: [] });
    expect(new Set([plain, large, sweet]).size).toBe(3);
  });
});
