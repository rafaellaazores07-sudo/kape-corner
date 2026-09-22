import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MenuView, Product } from "@/types";

/**
 * Featured drinks render the first three available products and resolve each
 * stored product image to a browser-displayable URL through
 * `storedFileBlob(...).getDirectURL()`. The router and the menu hook are
 * replaced with local typed mocks; this is component/integration coverage, not
 * deployed browser E2E.
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

const getDirectURL = vi.fn<(file: unknown) => string>();
const storedFileBlob = vi.fn((_file: unknown) => ({ getDirectURL }));

vi.mock("@/lib/backend", () => ({
  storedFileBlob: (file: unknown) => storedFileBlob(file),
}));

const useMenuView =
  vi.fn<
    () => { data: MenuView | undefined; isLoading: boolean; isError: boolean }
  >();

vi.mock("@/hooks/use-menu", () => ({
  useMenuView: () => useMenuView(),
}));

import { FeaturedDrinks } from "@/components/home/FeaturedDrinks";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1n,
    categoryId: 1n,
    name: "Iced Latte",
    description: "Espresso over ice with milk.",
    available: true,
    addOnIds: [],
    sizeOptionIds: [],
    price: 16000n,
    ...overrides,
  };
}

function makeView(products: Product[]): MenuView {
  return {
    categories: [],
    sizes: [],
    addOns: [],
    allProducts: products,
  };
}

describe("FeaturedDrinks", () => {
  beforeEach(() => {
    getDirectURL.mockReset();
    storedFileBlob.mockClear();
    useMenuView.mockReset();
  });

  it("resolves a stored product image to a displayable URL", () => {
    const image = {
      blob: new Uint8Array([1, 2, 3]),
      mimeType: "image/png",
      filename: "latte.png",
    };
    getDirectURL.mockReturnValue("https://cdn.example.ph/latte.png");
    useMenuView.mockReturnValue({
      data: makeView([makeProduct({ image })]),
      isLoading: false,
      isError: false,
    });

    render(<FeaturedDrinks />);

    // The stored file is passed through the shared blob helper, and the URL it
    // returns is what the card renders.
    expect(storedFileBlob).toHaveBeenCalledWith(image);
    expect(getDirectURL).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("img", { name: "Iced Latte" })).toHaveAttribute(
      "src",
      "https://cdn.example.ph/latte.png",
    );
  });

  it("falls back to the placeholder when a product has no image", () => {
    useMenuView.mockReturnValue({
      data: makeView([makeProduct({ name: "Americano" })]),
      isLoading: false,
      isError: false,
    });

    render(<FeaturedDrinks />);

    expect(storedFileBlob).not.toHaveBeenCalled();
    expect(screen.queryByRole("img", { name: "Americano" })).toBeNull();
    expect(screen.getByText("Americano")).toBeInTheDocument();
  });

  it("shows only the first three available products", () => {
    const products = [
      makeProduct({ id: 1n, name: "One" }),
      makeProduct({ id: 2n, name: "Two" }),
      makeProduct({ id: 3n, name: "Three" }),
      makeProduct({ id: 4n, name: "Four" }),
      makeProduct({ id: 5n, name: "Sold Out", available: false }),
    ];
    useMenuView.mockReturnValue({
      data: makeView(products),
      isLoading: false,
      isError: false,
    });

    render(<FeaturedDrinks />);

    expect(screen.getAllByTestId("home.featured.card")).toHaveLength(3);
    expect(screen.getByText("Three")).toBeInTheDocument();
    expect(screen.queryByText("Four")).toBeNull();
    expect(screen.queryByText("Sold Out")).toBeNull();
  });
});
