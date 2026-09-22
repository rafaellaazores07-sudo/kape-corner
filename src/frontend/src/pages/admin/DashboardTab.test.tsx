import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type DashboardStats,
  OrderStatus,
  type OrderSummary,
  OrderType,
  PaymentMethod,
} from "@/types";

/**
 * Characterization baseline for the admin dashboard: the counters render in
 * Philippine Peso and the recent-orders list shows the newest orders.
 *
 * The order hooks are replaced with local typed mocks; this is
 * component/integration coverage, not deployed browser E2E.
 */
const useDashboardStats =
  vi.fn<
    () => {
      data: DashboardStats | undefined;
      isLoading: boolean;
      isError: boolean;
    }
  >();

const useOrders =
  vi.fn<
    (filter: unknown) => {
      data: OrderSummary[] | undefined;
      isLoading: boolean;
      isError: boolean;
    }
  >();

vi.mock("@/hooks/use-orders", () => ({
  useDashboardStats: () => useDashboardStats(),
  useOrders: (filter: unknown) => useOrders(filter),
}));

import { DashboardTab } from "@/pages/admin/DashboardTab";

function makeSummary(overrides: Partial<OrderSummary> = {}): OrderSummary {
  return {
    orderNumber: "ORDER #20260922-001",
    customerName: "Maria Santos",
    orderType: OrderType.takeOut,
    paymentMethod: PaymentMethod.cash,
    status: OrderStatus.orderReceived,
    total: 33000n,
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<DashboardTab />, { wrapper: Wrapper });
}

describe("DashboardTab", () => {
  beforeEach(() => {
    useDashboardStats.mockReset();
    useOrders.mockReset();
    useDashboardStats.mockReturnValue({
      data: {
        totalOrders: 12n,
        pendingOrders: 3n,
        completedOrders: 8n,
        todaysSales: 45000n,
        totalSales: 1234000n,
      },
      isLoading: false,
      isError: false,
    });
    useOrders.mockReturnValue({
      data: [makeSummary()],
      isLoading: false,
      isError: false,
    });
  });

  it("renders the counters with peso-formatted sales", () => {
    renderDashboard();

    const total = screen.getByTestId("admin.dashboard.tile.1");
    expect(within(total).getByText("12")).toBeInTheDocument();

    const today = screen.getByTestId("admin.dashboard.tile.4");
    expect(within(today).getByText("₱450")).toBeInTheDocument();

    const lifetime = screen.getByTestId("admin.dashboard.tile.5");
    expect(within(lifetime).getByText("₱12,340")).toBeInTheDocument();
  });

  it("lists recent orders with their status and total", () => {
    renderDashboard();

    const item = screen.getByTestId("admin.dashboard.recent.item.1");
    expect(within(item).getByText("ORDER #20260922-001")).toBeInTheDocument();
    expect(within(item).getByText("Order received")).toBeInTheDocument();
    expect(within(item).getByText("₱330")).toBeInTheDocument();
  });

  it("shows the empty state when there are no orders", () => {
    useOrders.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderDashboard();

    expect(
      screen.getByTestId("admin.dashboard.empty_state"),
    ).toBeInTheDocument();
  });
});
