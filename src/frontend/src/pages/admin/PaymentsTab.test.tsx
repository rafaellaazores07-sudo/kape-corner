import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  OrderStatus,
  type OrderSummary,
  OrderType,
  PaymentMethod,
  type PaymentSettings,
} from "@/types";

/**
 * Characterization baseline for admin payment settings: the GCash/Maya numbers
 * are seeded from the backend and saved back, and the digital-payment reference
 * list shows only GCash/Maya orders.
 *
 * The menu/order hooks are replaced with local typed mocks; this is
 * component/integration coverage, not deployed browser E2E.
 */
const updateSettingsMutate = vi.fn();

/**
 * A stable settings object: the tab seeds its draft from this in an effect, so
 * returning a fresh object on every render would reset the user's edits.
 */
const SETTINGS = {
  gcashNumber: "0917 555 0142",
  mayaNumber: "0917 555 0143",
} satisfies Partial<PaymentSettings>;

vi.mock("@/hooks/use-menu", () => ({
  usePaymentSettings: () => ({
    data: SETTINGS,
    isLoading: false,
  }),
}));

const useOrders =
  vi.fn<
    (filter: unknown) => {
      data: OrderSummary[] | undefined;
      isLoading: boolean;
      isError: boolean;
    }
  >();

vi.mock("@/hooks/use-orders", () => ({
  useOrders: (filter: unknown) => useOrders(filter),
  useUpdatePaymentSettings: () => ({
    mutate: updateSettingsMutate,
    isPending: false,
    isError: false,
  }),
}));

import { PaymentsTab } from "@/pages/admin/PaymentsTab";

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

function renderPayments() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<PaymentsTab />, { wrapper: Wrapper });
}

describe("PaymentsTab", () => {
  beforeEach(() => {
    updateSettingsMutate.mockReset();
    useOrders.mockReset();
    useOrders.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
  });

  it("seeds the GCash and Maya numbers from the backend settings", () => {
    renderPayments();

    expect(screen.getByTestId("admin.payments.gcash_input")).toHaveValue(
      "0917 555 0142",
    );
    expect(screen.getByTestId("admin.payments.maya_input")).toHaveValue(
      "0917 555 0143",
    );
  });

  it("saves the edited payment numbers", async () => {
    const user = userEvent.setup();
    renderPayments();

    const gcash = screen.getByTestId("admin.payments.gcash_input");
    await user.clear(gcash);
    await user.type(gcash, "0917 999 0000");
    await user.click(screen.getByTestId("admin.payments.save_button"));

    await waitFor(() => {
      expect(updateSettingsMutate).toHaveBeenCalledTimes(1);
    });
    const [input] = updateSettingsMutate.mock.calls[0];
    expect(input.gcashNumber).toBe("0917 999 0000");
    expect(input.mayaNumber).toBe("0917 555 0143");
  });

  it("lists only GCash and Maya orders in the reference panel", () => {
    useOrders.mockReturnValue({
      data: [
        makeSummary({ orderNumber: "ORDER #20260922-001" }),
        makeSummary({
          orderNumber: "ORDER #20260922-002",
          paymentMethod: PaymentMethod.maya,
        }),
        makeSummary({
          orderNumber: "ORDER #20260922-003",
          paymentMethod: PaymentMethod.cash,
        }),
      ],
      isLoading: false,
      isError: false,
    });
    renderPayments();

    expect(
      screen.getByTestId("admin.payments.reference.item.1"),
    ).toHaveTextContent("ORDER #20260922-001");
    expect(
      screen.getByTestId("admin.payments.reference.item.2"),
    ).toHaveTextContent("ORDER #20260922-002");
    expect(screen.queryByTestId("admin.payments.reference.item.3")).toBeNull();
  });

  it("shows the empty state when there are no digital orders", () => {
    renderPayments();

    expect(
      screen.getByTestId("admin.payments.empty_state"),
    ).toBeInTheDocument();
  });
});
