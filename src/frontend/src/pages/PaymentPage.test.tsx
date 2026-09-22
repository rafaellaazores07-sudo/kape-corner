import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartLine, PlaceOrderInput } from "@/types";
import { OrderType } from "@/types";

/**
 * The payment step places the order and, on success, clears the cart and routes
 * to the confirmation page with the returned order number. The router and the
 * order/payment hooks are replaced with local typed mocks; this is
 * component/integration coverage, not deployed browser E2E.
 */
const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
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

const mutate =
  vi.fn<
    (
      input: PlaceOrderInput,
      options: { onSuccess: (result: unknown) => void; onError: () => void },
    ) => void
  >();

vi.mock("@/hooks/use-orders", () => ({
  usePlaceOrder: () => ({ mutate, isPending: false }),
}));

vi.mock("@/hooks/use-menu", () => ({
  usePaymentSettings: () => ({
    data: { gcashNumber: "0917 000 0000", mayaNumber: "0917 111 1111" },
    isLoading: false,
  }),
}));

import { PaymentPage } from "@/pages/PaymentPage";
import { useCartStore } from "@/store/cart";
import { useCheckoutStore } from "@/store/checkout";

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

function seedCart() {
  const line: Omit<CartLine, "lineId" | "unitPrice"> = {
    productId: 1n,
    productName: "Iced Latte",
    basePrice: 16000n,
    quantity: 1,
    sizeSurcharge: 0n,
    addOnIds: [],
    addOnNames: [],
    addOnsTotal: 0n,
  };
  useCartStore.getState().addLine(line);
}

describe("PaymentPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    mutate.mockReset();
    useCartStore.setState({ lines: [] });
    useCheckoutStore.getState().reset();
    seedCart();
    useCheckoutStore.getState().setOrderType(OrderType.takeOut);
    useCheckoutStore.getState().setCustomer({
      fullName: "Maria Santos",
      mobileNumber: "09175550142",
      email: "maria@example.ph",
    });
    useCheckoutStore.getState().setTakeOut({
      customerName: "Maria",
      contactNumber: "09175550142",
      pickupTime: "15:40",
    });
  });

  it("requires a reference number for GCash before placing the order", async () => {
    const user = userEvent.setup();
    render(<PaymentPage />);

    await user.click(screen.getByTestId("payment.submit_button"));

    expect(
      screen.getByTestId("payment.reference.error_state"),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("places the order and routes to confirmation with the order number", async () => {
    const user = userEvent.setup();
    mutate.mockImplementation((_input, options) => {
      options.onSuccess({ __kind__: "ok", ok: "ORDER #20260922-001" });
    });
    render(<PaymentPage />);

    await user.type(screen.getByTestId("payment.reference_input"), "GC-123456");
    await user.click(screen.getByTestId("payment.submit_button"));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1);
    });

    // The submitted order carries the checkout details and the cart line.
    const [input] = mutate.mock.calls[0];
    expect(input.customer.fullName).toBe("Maria Santos");
    expect(input.orderType).toBe(OrderType.takeOut);
    expect(input.items).toHaveLength(1);
    expect(input.items[0].productName).toBe("Iced Latte");
    expect(input.payment.referenceNumber).toBe("GC-123456");

    // Success clears the cart and navigates to the confirmation page.
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/confirmation",
        search: { order: "ORDER #20260922-001" },
      });
    });
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("sends the customer back to checkout when no order type is set", async () => {
    const user = userEvent.setup();
    // A cart with items but no Dine-In / Take-Out choice: payment must not
    // proceed, and the customer is routed back to complete checkout.
    useCheckoutStore.getState().reset();
    render(<PaymentPage />);

    await user.click(screen.getByTestId("payment.submit_button"));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/checkout" });
    });
    expect(mutate).not.toHaveBeenCalled();
  });
});
