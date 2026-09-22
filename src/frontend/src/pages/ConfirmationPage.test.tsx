import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Order, OrderStatus, OrderType, PaymentMethod } from "@/types";

/**
 * Characterization baseline for the confirmation step: after an order is placed
 * the customer sees the order number, the priced items, and the next-step
 * actions that lead to tracking. The router and the order hook are replaced
 * with local typed mocks; this is component/integration coverage, not deployed
 * browser E2E.
 */
let search: { order?: string } = {};

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => search,
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children: ReactNode;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

const useOrder =
  vi.fn<
    (orderNumber: string | undefined) => {
      data: Order | null | undefined;
      isLoading: boolean;
      isError: boolean;
    }
  >();

vi.mock("@/hooks/use-orders", () => ({
  useOrder: (orderNumber: string | undefined) => useOrder(orderNumber),
}));

import { ConfirmationPage } from "@/pages/ConfirmationPage";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    orderNumber: "ORDER #20260922-001",
    status: OrderStatus.orderReceived,
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
        unitPrice: 16000n,
        lineTotal: 32000n,
        customization: {
          sizeId: undefined,
          sugarLevel: "50%",
          iceLevel: "Less ice",
          milkOption: undefined,
          addOnIds: [],
        },
      },
    ],
    subtotal: 32000n,
    serviceFee: 1000n,
    total: 33000n,
    payment: { method: PaymentMethod.gcash, referenceNumber: "GC-123456" },
    createdAt: 1_700_000_000_000_000_000n,
    updatedAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

function renderConfirmation() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<ConfirmationPage />, { wrapper: Wrapper });
}

describe("ConfirmationPage", () => {
  beforeEach(() => {
    search = {};
    useOrder.mockReset();
  });

  it("asks for an order number when none is in the URL", () => {
    useOrder.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });
    renderConfirmation();

    expect(screen.getByTestId("confirmation.page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /No order selected/i }),
    ).toBeInTheDocument();
    expect(useOrder).toHaveBeenCalledWith(undefined);
  });

  it("shows the placed order's number, items, and total", () => {
    search = { order: "ORDER #20260922-001" };
    useOrder.mockReturnValue({
      data: makeOrder(),
      isLoading: false,
      isError: false,
    });
    renderConfirmation();

    expect(useOrder).toHaveBeenCalledWith("ORDER #20260922-001");
    expect(screen.getByTestId("confirmation.order_number")).toHaveTextContent(
      "ORDER #20260922-001",
    );
    expect(screen.getByTestId("confirmation.item.1")).toHaveTextContent(
      "2× Iced Latte",
    );
    expect(screen.getByTestId("confirmation.total")).toHaveTextContent("₱330");
    // The next-step action leads to tracking the order.
    expect(screen.getByTestId("confirmation.track_button")).toHaveAttribute(
      "href",
      "/track",
    );
  });

  it("shows a not-found state when the order cannot be loaded", () => {
    search = { order: "ORDER #20260922-999" };
    useOrder.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });
    renderConfirmation();

    expect(
      screen.getByRole("heading", { name: /couldn't find that order/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("confirmation.error_state.track_button"),
    ).toHaveAttribute("href", "/track");
  });
});
