import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Order, OrderStatus, OrderType, PaymentMethod } from "@/types";

/**
 * Characterization baseline for admin order management actions: the detail
 * dialog shows the full order, moves it through the status flow, verifies a
 * GCash/Maya payment, and cancels only behind a confirmation dialog.
 *
 * The order hooks are replaced with local typed mocks; this is
 * component/integration coverage, not deployed browser E2E.
 */
const useOrder =
  vi.fn<
    (orderNumber: string | undefined) => {
      data: Order | null | undefined;
      isLoading: boolean;
      isError: boolean;
    }
  >();

const updateStatusMutate = vi.fn();
const cancelMutate = vi.fn();
const verifyMutate = vi.fn();

vi.mock("@/hooks/use-orders", () => ({
  useOrder: (orderNumber: string | undefined) => useOrder(orderNumber),
  useUpdateOrderStatus: () => ({
    mutate: updateStatusMutate,
    isPending: false,
    isError: false,
  }),
  useCancelOrder: () => ({ mutate: cancelMutate, isPending: false }),
  useVerifyPayment: () => ({
    mutate: verifyMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

import { OrderDetailDialog } from "@/components/admin/OrderDetailDialog";

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

function renderDialog(orderNumber: string | null = "ORDER #20260922-001") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(
    <OrderDetailDialog orderNumber={orderNumber} onOpenChange={() => {}} />,
    { wrapper: Wrapper },
  );
}

describe("OrderDetailDialog", () => {
  beforeEach(() => {
    useOrder.mockReset();
    updateStatusMutate.mockReset();
    cancelMutate.mockReset();
    verifyMutate.mockReset();
    useOrder.mockReturnValue({
      data: makeOrder(),
      isLoading: false,
      isError: false,
    });
  });

  it("shows the order's customer, items, and payment reference", async () => {
    renderDialog();

    const dialog = await screen.findByTestId("admin.order.dialog");
    expect(within(dialog).getByText("Maria Santos")).toBeInTheDocument();
    expect(within(dialog).getByText("2× Iced Latte")).toBeInTheDocument();
    expect(within(dialog).getByText("GC-123456")).toBeInTheDocument();
    expect(within(dialog).getByText("₱330")).toBeInTheDocument();
  });

  it("moves the order to a new status when a status button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await screen.findByTestId("admin.order.dialog");
    await user.click(
      screen.getByTestId(`admin.order.status_button.${OrderStatus.preparing}`),
    );

    expect(updateStatusMutate).toHaveBeenCalledWith({
      orderNumber: "ORDER #20260922-001",
      status: OrderStatus.preparing,
    });
  });

  it("verifies a digital payment", async () => {
    const user = userEvent.setup();
    renderDialog();

    await screen.findByTestId("admin.order.dialog");
    await user.click(screen.getByTestId("admin.order.verify_payment_button"));

    expect(verifyMutate).toHaveBeenCalledWith("ORDER #20260922-001");
  });

  it("cancels the order only after the confirmation dialog is accepted", async () => {
    const user = userEvent.setup();
    renderDialog();

    await screen.findByTestId("admin.order.dialog");
    await user.click(screen.getByTestId("admin.order.cancel_button"));

    const confirm = await screen.findByTestId("admin.order.cancel_dialog");
    expect(cancelMutate).not.toHaveBeenCalled();

    await user.click(
      within(confirm).getByTestId("admin.order.cancel_confirm_button"),
    );

    await waitFor(() => {
      expect(cancelMutate).toHaveBeenCalledWith("ORDER #20260922-001");
    });
  });

  it("hides the verify action for a cash order", async () => {
    useOrder.mockReturnValue({
      data: makeOrder({ payment: { method: PaymentMethod.cash } }),
      isLoading: false,
      isError: false,
    });
    renderDialog();

    await screen.findByTestId("admin.order.dialog");
    expect(
      screen.queryByTestId("admin.order.verify_payment_button"),
    ).toBeNull();
  });
});
