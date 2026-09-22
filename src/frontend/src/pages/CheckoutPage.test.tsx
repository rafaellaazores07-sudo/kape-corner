import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartLine } from "@/types";

/**
 * Checkout must not advance to payment until an order type is chosen and the
 * required customer fields are valid. The router is replaced with local stubs;
 * this is component/integration coverage, not deployed browser E2E.
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

import { CheckoutPage } from "@/pages/CheckoutPage";
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

describe("CheckoutPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    useCartStore.setState({ lines: [] });
    useCheckoutStore.getState().reset();
    seedCart();
  });

  it("blocks progression to payment until an order type and valid details are provided", async () => {
    const user = userEvent.setup();
    render(<CheckoutPage />);

    // No order type yet: proceeding surfaces the order-type error and does not navigate.
    await user.click(screen.getByTestId("checkout.proceed_button"));
    expect(screen.getByTestId("checkout.order_type.error")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();

    // Choose take-out but leave the required take-out details blank.
    await user.click(screen.getByTestId("checkout.order_type.takeOut"));
    await user.click(screen.getByTestId("checkout.proceed_button"));
    expect(screen.getByTestId("checkout.details_error")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();

    // Fill the take-out details and valid customer fields.
    await user.type(screen.getByTestId("checkout.pickup_name_input"), "Maria");
    await user.type(
      screen.getByTestId("checkout.pickup_contact_input"),
      "09175550142",
    );
    await user.type(screen.getByTestId("checkout.pickup_time_input"), "15:40");
    await user.type(
      screen.getByTestId("checkout.full_name_input"),
      "Maria Santos",
    );
    await user.type(
      screen.getByTestId("checkout.mobile_number_input"),
      "09175550142",
    );
    await user.type(
      screen.getByTestId("checkout.email_input"),
      "maria@example.ph",
    );

    await user.click(screen.getByTestId("checkout.proceed_button"));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/payment" });
    });
  });
});
