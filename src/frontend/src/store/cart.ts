import { buildLineId } from "@/lib/format";
import type { CartLine, CartTotals } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Flat service fee in centavos (₱10) applied to every order. */
export const SERVICE_FEE_CENTAVOS = 1000n;

interface CartStore {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "lineId" | "unitPrice">) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * Coerce a money value to bigint. Persisted carts round-trip through JSON,
 * which turns bigint into string, so every read must tolerate both.
 */
export function toCentavos(value: bigint | number | string): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.round(value));
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

/** Revive a persisted cart line whose bigint fields were JSON-serialized. */
function reviveLine(line: CartLine): CartLine {
  return {
    ...line,
    basePrice: toCentavos(line.basePrice),
    sizeSurcharge: toCentavos(line.sizeSurcharge),
    addOnsTotal: toCentavos(line.addOnsTotal),
    unitPrice: toCentavos(line.unitPrice),
    addOnIds: (line.addOnIds ?? []).map((id) => toCentavos(id)),
  };
}

function computeUnitPrice(
  line: Omit<CartLine, "lineId" | "unitPrice">,
): bigint {
  return (
    toCentavos(line.basePrice) +
    toCentavos(line.sizeSurcharge) +
    toCentavos(line.addOnsTotal)
  );
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],
      addLine: (line) =>
        set((state) => {
          const lineId = buildLineId(line.productId, {
            sizeId: line.sizeId,
            sugarLevel: line.sugarLevel,
            iceLevel: line.iceLevel,
            milkOption: line.milkOption,
            addOnIds: line.addOnIds,
          });
          const unitPrice = computeUnitPrice(line);
          const existing = state.lines.find((item) => item.lineId === lineId);
          if (existing) {
            return {
              lines: state.lines.map((item) =>
                item.lineId === lineId
                  ? { ...item, quantity: item.quantity + line.quantity }
                  : item,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, lineId, unitPrice }] };
        }),
      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.lineId !== lineId),
        })),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.lineId !== lineId)
              : state.lines.map((line) =>
                  line.lineId === lineId ? { ...line, quantity } : line,
                ),
        })),
      clearCart: () => set({ lines: [] }),
    }),
    {
      name: "kape-corner-cart",
      merge: (persisted, current) => {
        const state = persisted as Partial<CartStore> | undefined;
        return {
          ...current,
          ...state,
          lines: (state?.lines ?? []).map(reviveLine),
        };
      },
    },
  ),
);

/** Derived cart totals in centavos. */
export function useCartTotals(): CartTotals {
  const lines = useCartStore((state) => state.lines);
  const subtotal = lines.reduce(
    (sum, line) => sum + toCentavos(line.unitPrice) * BigInt(line.quantity),
    0n,
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const serviceFee = lines.length > 0 ? SERVICE_FEE_CENTAVOS : 0n;
  return { subtotal, serviceFee, total: subtotal + serviceFee, itemCount };
}

/** Live cart item count for the header badge. */
export function useCartItemCount(): number {
  return useCartStore((state) =>
    state.lines.reduce((sum, line) => sum + line.quantity, 0),
  );
}
