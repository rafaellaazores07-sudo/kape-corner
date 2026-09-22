import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderSummary } from "@/components/cart/OrderSummary";
import type { CartTotals } from "@/types";

function totals(overrides: Partial<CartTotals> = {}): CartTotals {
  return {
    subtotal: 32000n,
    serviceFee: 1000n,
    total: 33000n,
    itemCount: 3,
    ...overrides,
  };
}

describe("OrderSummary", () => {
  it("shows the subtotal, service fee, and total in pesos", () => {
    render(<OrderSummary totals={totals()} />);

    expect(screen.getByTestId("cart.subtotal")).toHaveTextContent("₱320");
    expect(screen.getByTestId("cart.service_fee")).toHaveTextContent("₱10");
    expect(screen.getByTestId("cart.total")).toHaveTextContent("₱330");
  });

  it("pluralizes the item count", () => {
    const { rerender } = render(
      <OrderSummary totals={totals({ itemCount: 1 })} />,
    );
    expect(screen.getByText(/\(1 item\)/)).toBeInTheDocument();

    rerender(<OrderSummary totals={totals({ itemCount: 2 })} />);
    expect(screen.getByText(/\(2 items\)/)).toBeInTheDocument();
  });

  it("renders footer content passed as children", () => {
    render(
      <OrderSummary totals={totals()}>
        <button type="button">Continue to Payment</button>
      </OrderSummary>,
    );
    expect(
      screen.getByRole("button", { name: "Continue to Payment" }),
    ).toBeInTheDocument();
  });
});
