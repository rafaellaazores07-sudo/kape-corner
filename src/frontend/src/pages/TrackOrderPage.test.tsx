import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Order, OrderStatus, OrderType, PaymentMethod } from "@/types";

/**
 * Tracking looks an order up by the number shown on the confirmation page. The
 * router is replaced with a plain anchor and the backend actor with a typed
 * mock; this is component/integration coverage, not deployed browser E2E.
 */
vi.mock("@tanstack/react-router", () => ({
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

const getOrder = vi.fn<(orderNumber: string) => Promise<Order | null>>();

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: { getOrder }, isFetching: false }),
}));

import { TrackOrderPage } from "@/pages/TrackOrderPage";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    orderNumber: "ORDER #20260922-001",
    status: OrderStatus.preparing,
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
        quantity: 1n,
        unitPrice: 16000n,
        lineTotal: 16000n,
        customization: {
          sizeId: undefined,
          sugarLevel: undefined,
          iceLevel: undefined,
          milkOption: undefined,
          addOnIds: [],
        },
      },
    ],
    subtotal: 16000n,
    serviceFee: 1000n,
    total: 17000n,
    payment: { method: PaymentMethod.cash },
    createdAt: 1_700_000_000_000_000_000n,
    updatedAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

function renderTrack() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<TrackOrderPage />, { wrapper: Wrapper });
}

describe("TrackOrderPage", () => {
  beforeEach(() => {
    getOrder.mockReset();
  });

  it("shows the order's current status for a known order number", async () => {
    const user = userEvent.setup();
    getOrder.mockResolvedValue(makeOrder());
    renderTrack();

    await user.type(
      screen.getByTestId("track.order_number_input"),
      "ORDER #20260922-001",
    );
    await user.click(screen.getByTestId("track.submit_button"));

    await waitFor(() => {
      expect(getOrder).toHaveBeenCalledWith("ORDER #20260922-001");
    });
    expect(await screen.findByTestId("track.order_number")).toHaveTextContent(
      "ORDER #20260922-001",
    );
    expect(screen.getByTestId("track.status_badge")).toHaveTextContent(
      "Preparing",
    );
  });

  it("shows a not-found state for an unknown order number", async () => {
    const user = userEvent.setup();
    getOrder.mockResolvedValue(null);
    renderTrack();

    await user.type(
      screen.getByTestId("track.order_number_input"),
      "ORDER #20260922-999",
    );
    await user.click(screen.getByTestId("track.submit_button"));

    expect(
      await screen.findByTestId("track.not_found_state"),
    ).toHaveTextContent("ORDER #20260922-999");
  });

  it("retries the lookup when the error state's Try again is clicked", async () => {
    const user = userEvent.setup();
    getOrder.mockRejectedValueOnce(new Error("network down"));
    renderTrack();

    await user.type(
      screen.getByTestId("track.order_number_input"),
      "ORDER #20260922-001",
    );
    await user.click(screen.getByTestId("track.submit_button"));

    // The first lookup fails and the error state offers a retry.
    const errorState = await screen.findByTestId("track.error_state");
    expect(getOrder).toHaveBeenCalledTimes(1);

    // The retry re-runs the lookup and renders the recovered order.
    getOrder.mockResolvedValueOnce(makeOrder());
    await user.click(
      within(errorState).getByRole("button", { name: /try again/i }),
    );

    await waitFor(() => {
      expect(getOrder).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByTestId("track.order_number")).toHaveTextContent(
      "ORDER #20260922-001",
    );
  });
});
