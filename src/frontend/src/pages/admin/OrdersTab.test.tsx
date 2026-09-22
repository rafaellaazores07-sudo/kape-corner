import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type OrderFilter,
  OrderStatus,
  type OrderSummary,
  OrderType,
  PaymentMethod,
} from "@/types";

/**
 * Characterization baseline for admin order management: the order list renders
 * each order's number, customer, type, payment, status, and total, and the
 * status/type filter chips re-query the backend with the chosen filter.
 *
 * The order hooks and the detail dialog are replaced with local typed mocks;
 * this is component/integration coverage, not deployed browser E2E.
 */
const useOrders =
  vi.fn<
    (filter: OrderFilter) => {
      data: OrderSummary[] | undefined;
      isLoading: boolean;
      isError: boolean;
    }
  >();

vi.mock("@/hooks/use-orders", () => ({
  useOrders: (filter: OrderFilter) => useOrders(filter),
}));

vi.mock("@/components/admin/OrderDetailDialog", () => ({
  OrderDetailDialog: ({ orderNumber }: { orderNumber: string | null }) => (
    <div data-ocid="stub.order_dialog">{orderNumber ?? ""}</div>
  ),
}));

import { OrdersTab } from "@/pages/admin/OrdersTab";

function makeSummary(overrides: Partial<OrderSummary> = {}): OrderSummary {
  return {
    orderNumber: "ORDER #20260922-001",
    customerName: "Maria Santos",
    orderType: OrderType.takeOut,
    paymentMethod: PaymentMethod.gcash,
    status: OrderStatus.orderReceived,
    total: 33000n,
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

function renderOrders() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<OrdersTab />, { wrapper: Wrapper });
}

describe("OrdersTab", () => {
  beforeEach(() => {
    useOrders.mockReset();
  });

  it("lists orders with their customer, type, payment, status, and total", () => {
    useOrders.mockReturnValue({
      data: [makeSummary()],
      isLoading: false,
      isError: false,
    });
    renderOrders();

    const row = screen.getByTestId("admin.orders.row.1");
    expect(within(row).getByText("ORDER #20260922-001")).toBeInTheDocument();
    expect(within(row).getByText("Maria Santos")).toBeInTheDocument();
    expect(within(row).getByText("Take-out")).toBeInTheDocument();
    expect(within(row).getByText("GCash")).toBeInTheDocument();
    expect(within(row).getByText("Order received")).toBeInTheDocument();
    expect(within(row).getByText("₱330")).toBeInTheDocument();
  });

  it("shows the empty state when no orders match", () => {
    useOrders.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderOrders();

    expect(screen.getByTestId("admin.orders.empty_state")).toBeInTheDocument();
  });

  it("re-queries with the chosen status filter", async () => {
    const user = userEvent.setup();
    useOrders.mockReturnValue({
      data: [makeSummary()],
      isLoading: false,
      isError: false,
    });
    renderOrders();

    await user.click(
      screen.getByTestId("admin.orders.status_filter.readyForPickup"),
    );

    await waitFor(() => {
      expect(useOrders).toHaveBeenLastCalledWith({
        status: OrderStatus.readyForPickup,
      });
    });
  });

  it("re-queries with the chosen order-type filter", async () => {
    const user = userEvent.setup();
    useOrders.mockReturnValue({
      data: [makeSummary()],
      isLoading: false,
      isError: false,
    });
    renderOrders();

    await user.click(screen.getByTestId("admin.orders.type_filter.dineIn"));

    await waitFor(() => {
      expect(useOrders).toHaveBeenLastCalledWith({
        orderType: OrderType.dineIn,
      });
    });
  });

  it("opens the detail dialog for the selected order", async () => {
    const user = userEvent.setup();
    useOrders.mockReturnValue({
      data: [makeSummary()],
      isLoading: false,
      isError: false,
    });
    renderOrders();

    await user.click(screen.getByTestId("admin.orders.view_button.1"));

    expect(screen.getByTestId("stub.order_dialog")).toHaveTextContent(
      "ORDER #20260922-001",
    );
  });
});
