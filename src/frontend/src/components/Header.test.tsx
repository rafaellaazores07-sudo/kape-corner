import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization baseline for the header's navigation contract, extended for
 * the login/register fix.
 *
 * The request under way moved "Login / Register" from the admin dashboard to a
 * dedicated `/auth` page and made the header reflect signed-in state. This file
 * protects the adjacent working behavior that must survive the change (brand
 * link, desktop nav, cart link and its live badge, Order Now, mobile menu) and
 * asserts the new destination and signed-in/sign-out states.
 *
 * The router is not under test, so `Link` renders a plain anchor and
 * `useRouterState` reports a fixed pathname. Internet Identity is replaced with
 * a local typed mock, matching the seam used by AdminGuard.test.tsx. This is
 * component/integration coverage with local mocks — not deployed browser E2E.
 */
let pathname = "/";
const navigate = vi.fn();

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
  useNavigate: () => navigate,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname } }),
}));

const identity = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: vi.fn(),
  clear: vi.fn(),
};

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => identity,
}));

import { Header } from "@/components/Header";
import { useCartStore } from "@/store/cart";

/**
 * The cart holds `bigint` centavo amounts, which the persist middleware's
 * default JSON storage cannot serialize. Install a raw in-memory storage that
 * keeps the state object as-is so the badge path can run; the serialization
 * failure itself is reported separately as a product finding.
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

/**
 * Header calls `useQueryClient()` to clear cached data on sign-out, so every
 * render needs a QueryClientProvider.
 */
function renderHeader() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<Header />, { wrapper: Wrapper });
}

describe("Header", () => {
  beforeEach(() => {
    pathname = "/";
    identity.isAuthenticated = false;
    identity.isInitializing = false;
    identity.isLoggingIn = false;
    identity.login.mockReset();
    identity.clear.mockReset();
    navigate.mockReset();
    useCartStore.setState({ lines: [] });
  });

  it("renders the brand, desktop nav, cart, and Order Now links", () => {
    renderHeader();

    expect(screen.getByTestId("header.brand_link")).toHaveAttribute(
      "href",
      "/",
    );

    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const [label, href] of [
      ["Home", "/"],
      ["Menu", "/menu"],
      ["About Us", "/about"],
      ["Contact Us", "/contact"],
    ] as const) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }

    expect(screen.getByTestId("header.cart_link")).toHaveAttribute(
      "href",
      "/cart",
    );
    expect(screen.getByTestId("header.order_now_button")).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("marks the active nav link for the current pathname", () => {
    pathname = "/menu";
    renderHeader();

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Menu" })).toHaveClass(
      "bg-secondary",
    );
    expect(within(nav).getByRole("link", { name: "Home" })).not.toHaveClass(
      "bg-secondary",
    );
  });

  it("shows the live cart item count and hides the badge when empty", () => {
    useCartStore.setState({
      lines: [
        {
          lineId: "a",
          productId: 1n,
          productName: "Americano",
          basePrice: 12000n,
          sizeId: 1n,
          sizeName: "Small",
          sizeSurcharge: 0n,
          addOnIds: [],
          addOnNames: [],
          addOnsTotal: 0n,
          sugarLevel: "100",
          iceLevel: "100",
          milkOption: "whole",
          quantity: 2,
          unitPrice: 12000n,
        },
      ],
    });

    renderHeader();

    expect(screen.getByTestId("header.cart_count")).toHaveTextContent("2");
    expect(screen.getByTestId("header.cart_link")).toHaveAttribute(
      "aria-label",
      "Cart, 2 items",
    );
  });

  it("opens and closes the mobile menu with its link set", async () => {
    const user = userEvent.setup();
    renderHeader();

    expect(screen.queryByTestId("header.mobile_menu")).toBeNull();

    const toggle = screen.getByTestId("header.mobile_menu_button");
    await user.click(toggle);

    const mobileNav = screen.getByTestId("header.mobile_menu");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      within(mobileNav).getByTestId("header.mobile_order_now_button"),
    ).toHaveAttribute("href", "/menu");
    expect(
      within(mobileNav).getByRole("link", { name: "Contact Us" }),
    ).toHaveAttribute("href", "/contact");

    await user.click(toggle);
    expect(screen.queryByTestId("header.mobile_menu")).toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("routes the anonymous desktop and mobile login controls to /auth, not /admin", async () => {
    const user = userEvent.setup();
    renderHeader();

    expect(screen.getByTestId("header.login_link")).toHaveAttribute(
      "href",
      "/auth",
    );
    expect(screen.getByTestId("header.login_link")).not.toHaveAttribute(
      "href",
      "/admin",
    );

    await user.click(screen.getByTestId("header.mobile_menu_button"));
    expect(screen.getByTestId("header.mobile_login_link")).toHaveAttribute(
      "href",
      "/auth",
    );
    expect(screen.getByTestId("header.mobile_login_link")).not.toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("shows a sign-out action instead of the login link when authenticated", async () => {
    identity.isAuthenticated = true;
    const user = userEvent.setup();
    renderHeader();

    // Desktop: the login link is replaced by a sign-out button.
    expect(screen.queryByTestId("header.login_link")).not.toHaveAttribute(
      "href",
      "/auth",
    );
    const desktopSignOut = screen.getByTestId("header.login_link");
    expect(desktopSignOut).toHaveTextContent(/sign out/i);

    await user.click(desktopSignOut);
    expect(identity.clear).toHaveBeenCalledTimes(1);
    // Signing out of the storefront returns the customer to the customer login.
    expect(navigate).toHaveBeenCalledWith({ to: "/auth", replace: true });

    // Mobile: the login link is replaced by a sign-out button too.
    await user.click(screen.getByTestId("header.mobile_menu_button"));
    const mobileSignOut = screen.getByTestId("header.mobile_login_link");
    expect(mobileSignOut).toHaveTextContent(/sign out/i);
    expect(mobileSignOut).not.toHaveAttribute("href", "/auth");
  });
});
