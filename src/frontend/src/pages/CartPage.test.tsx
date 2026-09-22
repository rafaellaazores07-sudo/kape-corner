import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartLine } from "@/types";

/**
 * Characterization baseline for the cart step of the customer journey: review
 * the lines, change quantities, and remove or clear items behind a confirmation
 * dialog before proceeding to checkout.
 *
 * The router is not under test, so `Link` renders a plain anchor. This is
 * component/integration coverage over the real cart store — not deployed
 * browser E2E.
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

import { CartPage } from "@/pages/CartPage";
import { useCartStore } from "@/store/cart";

/**
 * The cart holds `bigint` centavo amounts, which the persist middleware's
 * default JSON storage cannot serialize. Install a raw in-memory storage that
 * keeps the state object as-is so the cart page can render.
 */
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

function seedLine(
  overrides: Partial<Omit<CartLine, "lineId" | "unitPrice">> = {},
) {
  useCartStore.getState().addLine({
    productId: 1n,
    productName: "Iced Latte",
    basePrice: 16000n,
    quantity: 1,
    sizeSurcharge: 0n,
    addOnIds: [],
    addOnNames: [],
    addOnsTotal: 0n,
    ...overrides,
  });
}

describe("CartPage", () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] });
  });

  it("shows the empty state with a link back to the menu", () => {
    render(<CartPage />);

    expect(screen.getByTestId("cart.empty_state")).toBeInTheDocument();
    expect(screen.getByTestId("cart.browse_menu_button")).toHaveAttribute(
      "href",
      "/menu",
    );
    expect(screen.queryByTestId("cart.list")).toBeNull();
  });

  it("lists the seeded line with its peso total and a checkout link", () => {
    seedLine({ quantity: 2 });
    render(<CartPage />);

    const list = screen.getByTestId("cart.list");
    expect(within(list).getByText("Iced Latte")).toBeInTheDocument();
    // 2 × ₱160 = ₱320, plus the flat ₱10 service fee.
    expect(screen.getByTestId("cart.line_total.1")).toHaveTextContent("₱320");
    expect(screen.getByTestId("cart.subtotal")).toHaveTextContent("₱320");
    expect(screen.getByTestId("cart.service_fee")).toHaveTextContent("₱10");
    expect(screen.getByTestId("cart.total")).toHaveTextContent("₱330");
    expect(screen.getByTestId("cart.checkout_button")).toHaveAttribute(
      "href",
      "/checkout",
    );
  });

  it("raises the quantity and the totals when the increase control is used", async () => {
    const user = userEvent.setup();
    seedLine({ quantity: 1 });
    render(<CartPage />);

    await user.click(screen.getByTestId("cart.increase_button.1"));

    await waitFor(() => {
      expect(screen.getByTestId("cart.quantity.1")).toHaveTextContent("2");
    });
    expect(screen.getByTestId("cart.line_total.1")).toHaveTextContent("₱320");
    expect(screen.getByTestId("cart.total")).toHaveTextContent("₱330");
  });

  it("removes a line only after the confirmation dialog is accepted", async () => {
    const user = userEvent.setup();
    seedLine();
    render(<CartPage />);

    await user.click(screen.getByTestId("cart.remove_button.1"));

    // The dialog appears and the line is still present until confirmed.
    const dialog = await screen.findByTestId("cart.remove_dialog");
    expect(useCartStore.getState().lines).toHaveLength(1);

    await user.click(within(dialog).getByTestId("cart.remove_confirm_button"));

    await waitFor(() => {
      expect(useCartStore.getState().lines).toHaveLength(0);
    });
    expect(screen.getByTestId("cart.empty_state")).toBeInTheDocument();
  });

  it("keeps the line when the removal dialog is dismissed", async () => {
    const user = userEvent.setup();
    seedLine();
    render(<CartPage />);

    await user.click(screen.getByTestId("cart.remove_button.1"));
    const dialog = await screen.findByTestId("cart.remove_dialog");
    await user.click(within(dialog).getByTestId("cart.remove_cancel_button"));

    await waitFor(() => {
      expect(screen.queryByTestId("cart.remove_dialog")).toBeNull();
    });
    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("clears the whole cart only after the confirmation dialog is accepted", async () => {
    const user = userEvent.setup();
    seedLine();
    seedLine({ productId: 2n, productName: "Croissant", basePrice: 8000n });
    render(<CartPage />);

    await user.click(screen.getByTestId("cart.clear_button"));
    const dialog = await screen.findByTestId("cart.clear_dialog");
    expect(useCartStore.getState().lines).toHaveLength(2);

    await user.click(within(dialog).getByTestId("cart.clear_confirm_button"));

    await waitFor(() => {
      expect(useCartStore.getState().lines).toHaveLength(0);
    });
  });
});
