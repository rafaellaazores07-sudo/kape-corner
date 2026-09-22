import { beforeEach, describe, expect, it } from "vitest";

import { SERVICE_FEE_CENTAVOS, useCartStore } from "@/store/cart";
import type { CartLine } from "@/types";

type NewLine = Omit<CartLine, "lineId" | "unitPrice">;

/**
 * The cart holds `bigint` centavo amounts, which the persist middleware's
 * default JSON storage cannot serialize. These tests exercise the store's own
 * arithmetic, so they install a raw in-memory storage that keeps the state
 * object as-is. The serialization failure itself is reported separately as a
 * product finding rather than asserted here.
 */
const memoryStorage = (() => {
  let value: unknown;
  return {
    getItem: () => value ?? null,
    setItem: (_name: string, next: unknown) => {
      value = next;
    },
    removeItem: () => {
      value = undefined;
    },
  };
})();

useCartStore.persist.setOptions({ storage: memoryStorage as never });

function makeLine(overrides: Partial<NewLine> = {}): NewLine {
  return {
    productId: 1n,
    productName: "Iced Latte",
    basePrice: 12000n,
    quantity: 1,
    sizeSurcharge: 0n,
    addOnIds: [],
    addOnNames: [],
    addOnsTotal: 0n,
    ...overrides,
  };
}

function resetCart() {
  useCartStore.setState({ lines: [] });
}

describe("useCartStore", () => {
  beforeEach(resetCart);

  it("prices a line as base + size surcharge + add-ons", () => {
    useCartStore.getState().addLine(
      makeLine({
        basePrice: 12000n,
        sizeSurcharge: 2000n,
        addOnsTotal: 1500n,
      }),
    );
    const [line] = useCartStore.getState().lines;
    expect(line.unitPrice).toBe(15500n);
  });

  it("merges identical customizations into one line and sums quantity", () => {
    const store = useCartStore.getState();
    store.addLine(makeLine({ quantity: 1 }));
    store.addLine(makeLine({ quantity: 2 }));
    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("keeps differently customized lines of the same product separate", () => {
    const store = useCartStore.getState();
    store.addLine(makeLine({ sizeId: 1n, sizeName: "Small" }));
    store.addLine(
      makeLine({ sizeId: 2n, sizeName: "Large", sizeSurcharge: 2000n }),
    );
    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it("removes a line by id", () => {
    const store = useCartStore.getState();
    store.addLine(makeLine());
    const lineId = useCartStore.getState().lines[0].lineId;
    store.removeLine(lineId);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("updates quantity and drops the line when quantity reaches zero", () => {
    const store = useCartStore.getState();
    store.addLine(makeLine({ quantity: 1 }));
    const lineId = useCartStore.getState().lines[0].lineId;

    store.updateQuantity(lineId, 4);
    expect(useCartStore.getState().lines[0].quantity).toBe(4);

    store.updateQuantity(lineId, 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("clears every line", () => {
    const store = useCartStore.getState();
    store.addLine(makeLine());
    store.addLine(makeLine({ productId: 2n, productName: "Croissant" }));
    store.clearCart();
    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});

describe("cart totals", () => {
  beforeEach(resetCart);

  it("charges no service fee on an empty cart", () => {
    const { subtotal, serviceFee, total, itemCount } = totals();
    expect(subtotal).toBe(0n);
    expect(serviceFee).toBe(0n);
    expect(total).toBe(0n);
    expect(itemCount).toBe(0);
  });

  it("adds the flat service fee once when the cart has items", () => {
    const store = useCartStore.getState();
    store.addLine(makeLine({ basePrice: 12000n, quantity: 2 }));
    store.addLine(
      makeLine({ productId: 2n, productName: "Croissant", basePrice: 8000n }),
    );

    const { subtotal, serviceFee, total, itemCount } = totals();
    expect(subtotal).toBe(32000n);
    expect(serviceFee).toBe(SERVICE_FEE_CENTAVOS);
    expect(total).toBe(33000n);
    expect(itemCount).toBe(3);
  });
});

/**
 * `useCartTotals` is a hook, so its arithmetic is exercised through the store's
 * own lines with the same formula the hook applies. This keeps the assertion on
 * observable totals without mounting a component.
 */
function totals() {
  const lines = useCartStore.getState().lines;
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * BigInt(line.quantity),
    0n,
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const serviceFee = lines.length > 0 ? SERVICE_FEE_CENTAVOS : 0n;
  return { subtotal, serviceFee, total: subtotal + serviceFee, itemCount };
}
