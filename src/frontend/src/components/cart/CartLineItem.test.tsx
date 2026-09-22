import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CartLineItem } from "@/components/cart/CartLineItem";
import type { CartLine } from "@/types";

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: "1|-|-|-|-|-",
    productId: 1n,
    productName: "Iced Latte",
    basePrice: 12000n,
    quantity: 2,
    sizeSurcharge: 0n,
    addOnIds: [],
    addOnNames: [],
    addOnsTotal: 0n,
    unitPrice: 12000n,
    ...overrides,
  };
}

describe("CartLineItem", () => {
  it("shows the unit price and the line total for the quantity", () => {
    render(
      <CartLineItem
        line={makeLine({ unitPrice: 12000n, quantity: 2 })}
        index={0}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("₱120 each")).toBeInTheDocument();
    expect(screen.getByTestId("cart.line_total.1")).toHaveTextContent("₱240");
    expect(screen.getByTestId("cart.quantity.1")).toHaveTextContent("2");
  });

  it("summarizes the chosen customizations", () => {
    render(
      <CartLineItem
        line={makeLine({
          sizeName: "Large",
          sugarLevel: "50%",
          iceLevel: "Less",
          milkOption: "Oat",
          addOnNames: ["Extra Shot"],
        })}
        index={0}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Large · 50% sugar · Less ice · Oat · Extra Shot"),
    ).toBeInTheDocument();
  });

  it("reports quantity changes through the callback", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();
    render(
      <CartLineItem
        line={makeLine({ quantity: 2 })}
        index={0}
        onQuantityChange={onQuantityChange}
        onRemove={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Increase quantity of Iced Latte" }),
    );
    expect(onQuantityChange).toHaveBeenCalledWith("1|-|-|-|-|-", 3);

    await user.click(
      screen.getByRole("button", { name: "Decrease quantity of Iced Latte" }),
    );
    expect(onQuantityChange).toHaveBeenCalledWith("1|-|-|-|-|-", 1);
  });

  it("disables the decrease button at quantity one", () => {
    render(
      <CartLineItem
        line={makeLine({ quantity: 1 })}
        index={0}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Decrease quantity of Iced Latte" }),
    ).toBeDisabled();
  });

  it("reports removal through the callback", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const line = makeLine();
    render(
      <CartLineItem
        line={line}
        index={0}
        onQuantityChange={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove Iced Latte from cart" }),
    );
    expect(onRemove).toHaveBeenCalledWith(line);
  });
});
