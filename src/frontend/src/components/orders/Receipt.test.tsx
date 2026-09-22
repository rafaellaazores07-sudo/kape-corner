import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Receipt } from "@/components/orders/Receipt";
import { type Order, OrderStatus, OrderType, PaymentMethod } from "@/types";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    orderNumber: "ORDER #20260922-001",
    status: OrderStatus.orderConfirmed,
    orderType: OrderType.takeOut,
    customer: {
      fullName: "Maria Santos",
      mobileNumber: "0917 555 0142",
      email: "maria@example.ph",
    },
    takeOut: { pickupTime: "3:40 PM" },
    specialInstructions: "",
    items: [
      {
        productId: 1n,
        productName: "Iced Latte",
        quantity: 2n,
        unitPrice: 12000n,
        lineTotal: 24000n,
        customization: {
          sizeId: undefined,
          sugarLevel: undefined,
          iceLevel: undefined,
          milkOption: undefined,
          addOnIds: [],
        },
      },
    ],
    subtotal: 24000n,
    serviceFee: 1000n,
    total: 25000n,
    payment: { method: PaymentMethod.gcash, referenceNumber: "GC-123456" },
    createdAt: 1_700_000_000_000_000_000n,
    updatedAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

describe("Receipt", () => {
  it("prints the shop, order number, customer, and totals", () => {
    render(<Receipt order={makeOrder()} />);

    expect(screen.getByText("Kape Corner")).toBeInTheDocument();
    expect(screen.getByTestId("receipt.order_number")).toHaveTextContent(
      "ORDER #20260922-001",
    );
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByTestId("receipt.total")).toHaveTextContent("₱250");
    expect(screen.getByTestId("receipt.reference_number")).toHaveTextContent(
      "GC-123456",
    );
  });

  it("lists each ordered item with its line total", () => {
    render(<Receipt order={makeOrder()} />);
    expect(screen.getByTestId("receipt.item.1")).toHaveTextContent(
      "Iced Latte",
    );
    expect(screen.getByTestId("receipt.item.1")).toHaveTextContent("₱240");
  });

  it("shows the dine-in table when the order is dine-in", () => {
    render(
      <Receipt
        order={makeOrder({
          orderType: OrderType.dineIn,
          takeOut: undefined,
          dineIn: { tableNumber: "7", numberOfCustomers: 2n },
        })}
      />,
    );
    expect(screen.getByText("Dine In · Table 7")).toBeInTheDocument();
  });

  it("falls back to an em dash when there is no payment reference", () => {
    render(
      <Receipt
        order={makeOrder({ payment: { method: PaymentMethod.cash } })}
      />,
    );
    expect(screen.getByTestId("receipt.reference_number")).toHaveTextContent(
      "—",
    );
  });
});
