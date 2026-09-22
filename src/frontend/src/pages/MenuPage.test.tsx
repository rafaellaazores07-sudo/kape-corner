import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Menu } from "@/types";

/**
 * The menu page reads the backend through `useBackendActor`. The router is not
 * under test, so `useNavigate`/`useSearch` are replaced with local stubs that
 * keep the search state in memory. This is component/integration coverage over
 * real components with a typed actor mock — not deployed browser E2E.
 */
const navigate = vi.fn();
let search: { q?: string; category?: string; sort?: string } = {};

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useSearch: () => search,
}));

const getMenu = vi.fn<() => Promise<Menu>>();

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: { getMenu }, isFetching: false }),
}));

import { MenuPage } from "@/pages/MenuPage";
import { useCartStore } from "@/store/cart";

/**
 * The cart holds `bigint` centavo amounts, which the persist middleware's
 * default JSON storage cannot serialize. Install a raw in-memory storage that
 * keeps the state object as-is so the add-to-cart path can run; the
 * serialization failure itself is reported separately as a product finding.
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

const MENU: Menu = {
  categories: [
    { id: 1n, name: "Hot Coffee", sortOrder: 1n },
    { id: 2n, name: "Iced Coffee", sortOrder: 2n },
    { id: 3n, name: "Non-Coffee", sortOrder: 3n },
    { id: 4n, name: "Pastries & Snacks", sortOrder: 4n },
  ],
  sizes: [
    { id: 1n, name: "Small", surcharge: 0n },
    { id: 2n, name: "Medium", surcharge: 2000n },
    { id: 3n, name: "Large", surcharge: 4000n },
  ],
  addOns: [
    { id: 1n, name: "Extra Shot", price: 3000n, available: true },
    { id: 2n, name: "Extra Syrup", price: 2000n, available: true },
  ],
  products: [
    {
      id: 1n,
      categoryId: 1n,
      name: "Americano",
      description: "Rich espresso shots topped with hot water.",
      price: 12000n,
      image: undefined,
      available: true,
      sizeOptionIds: [1n, 2n, 3n],
      addOnIds: [1n, 2n],
    },
    {
      id: 7n,
      categoryId: 2n,
      name: "Iced Americano",
      description: "Chilled espresso over ice.",
      price: 13000n,
      image: undefined,
      available: true,
      sizeOptionIds: [1n, 2n, 3n],
      addOnIds: [1n, 2n],
    },
    {
      id: 12n,
      categoryId: 3n,
      name: "Chocolate",
      description: "Rich, creamy hot chocolate.",
      price: 14000n,
      image: undefined,
      available: true,
      sizeOptionIds: [1n, 2n, 3n],
      addOnIds: [1n, 2n],
    },
    {
      id: 16n,
      categoryId: 4n,
      name: "Croissant",
      description: "Flaky, buttery French pastry.",
      price: 8000n,
      image: undefined,
      available: true,
      sizeOptionIds: [],
      addOnIds: [],
    },
  ],
};

function renderMenu() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<MenuPage />, { wrapper: Wrapper });
}

describe("MenuPage", () => {
  beforeEach(() => {
    search = {};
    navigate.mockReset();
    getMenu.mockReset();
    getMenu.mockResolvedValue(MENU);
    useCartStore.setState({ lines: [] });
  });

  it("shows all four categories with prices in Philippine Peso", async () => {
    renderMenu();

    // Each category renders its own section; the filter also names them, so
    // assert on the section headings.
    await waitFor(() => {
      expect(screen.getByTestId("menu.category.section.1")).toBeInTheDocument();
    });
    for (const [id, name] of [
      ["1", "Hot Coffee"],
      ["2", "Iced Coffee"],
      ["3", "Non-Coffee"],
      ["4", "Pastries & Snacks"],
    ] as const) {
      const section = screen.getByTestId(`menu.category.section.${id}`);
      expect(
        within(section).getByRole("heading", { name }),
      ).toBeInTheDocument();
    }

    // Prices render with the peso sign, not a bare number.
    expect(screen.getAllByText(/₱/).length).toBeGreaterThan(0);
    expect(screen.getByText("₱120")).toBeInTheDocument();
  });

  it("raises the price when Large plus an extra shot is selected, and the cart line reflects it", async () => {
    const user = userEvent.setup();
    renderMenu();

    await waitFor(() => {
      expect(screen.getByText("Americano")).toBeInTheDocument();
    });

    // Open the customizer for Americano (base ₱120). The add-button index is
    // per-category, so scope to the Hot Coffee section.
    const hotCoffee = screen.getByTestId("menu.category.section.1");
    await user.click(
      within(hotCoffee).getByTestId("menu.product.add_button.1"),
    );

    const dialog = await screen.findByTestId("menu.customizer.dialog");
    expect(
      within(dialog).getByTestId("menu.customizer.total"),
    ).toHaveTextContent("₱120");

    // Large adds ₱40, Extra Shot adds ₱30 → ₱190.
    await user.click(screen.getByTestId("menu.customizer.size.large"));
    await user.click(screen.getByTestId("menu.customizer.addon.extra_shot"));

    await waitFor(() => {
      expect(
        within(dialog).getByTestId("menu.customizer.total"),
      ).toHaveTextContent("₱190");
    });

    await user.click(screen.getByTestId("menu.customizer.add_to_cart_button"));

    const [line] = useCartStore.getState().lines;
    expect(line.productName).toBe("Americano");
    expect(line.sizeName).toBe("Large");
    expect(line.addOnNames).toEqual(["Extra Shot"]);
    expect(line.unitPrice).toBe(19000n);
    expect(line.unitPrice).toBeGreaterThan(line.basePrice);
  });
});
