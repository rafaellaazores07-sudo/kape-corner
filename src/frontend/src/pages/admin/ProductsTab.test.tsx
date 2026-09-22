import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MenuView } from "@/types";

/**
 * Characterization baseline for admin menu management: products, categories,
 * and add-ons render from the menu view, and the create/rename/delete actions
 * call the matching backend mutation.
 *
 * The menu hooks and the product form dialog are replaced with local typed
 * mocks; this is component/integration coverage, not deployed browser E2E.
 */
const createProductMutate = vi.fn();
const deleteProductMutate = vi.fn();
const createCategoryMutate = vi.fn();
const updateCategoryMutate = vi.fn();
const deleteCategoryMutate = vi.fn();
const createAddOnMutate = vi.fn();
const updateAddOnMutate = vi.fn();
const deleteAddOnMutate = vi.fn();

const useMenuView =
  vi.fn<
    () => {
      data: MenuView | undefined;
      isLoading: boolean;
      isError: boolean;
    }
  >();

vi.mock("@/hooks/use-menu", () => ({
  useMenuView: () => useMenuView(),
  useCreateProduct: () => ({ mutate: createProductMutate, isPending: false }),
  useUpdateProduct: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteProduct: () => ({ mutate: deleteProductMutate, isPending: false }),
  useCreateCategory: () => ({ mutate: createCategoryMutate, isPending: false }),
  useUpdateCategory: () => ({ mutate: updateCategoryMutate, isPending: false }),
  useDeleteCategory: () => ({ mutate: deleteCategoryMutate, isPending: false }),
  useCreateAddOn: () => ({ mutate: createAddOnMutate, isPending: false }),
  useUpdateAddOn: () => ({ mutate: updateAddOnMutate, isPending: false }),
  useDeleteAddOn: () => ({ mutate: deleteAddOnMutate, isPending: false }),
}));

vi.mock("@/components/admin/ProductFormDialog", () => ({
  ProductFormDialog: ({ open }: { open: boolean }) =>
    open ? <div data-ocid="stub.product_form" /> : null,
}));

import { ProductsTab } from "@/pages/admin/ProductsTab";

const VIEW: MenuView = {
  categories: [
    { id: 1n, name: "Hot Coffee", sortOrder: 1n, products: [] },
    { id: 2n, name: "Iced Coffee", sortOrder: 2n, products: [] },
  ],
  sizes: [{ id: 1n, name: "Small", surcharge: 0n }],
  addOns: [{ id: 1n, name: "Extra Shot", price: 3000n, available: true }],
  allProducts: [
    {
      id: 1n,
      categoryId: 1n,
      name: "Americano",
      description: "Rich espresso shots.",
      price: 12000n,
      available: true,
      sizeOptionIds: [1n],
      addOnIds: [1n],
    },
  ],
};

function renderProducts() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<ProductsTab />, { wrapper: Wrapper });
}

describe("ProductsTab", () => {
  beforeEach(() => {
    createProductMutate.mockReset();
    deleteProductMutate.mockReset();
    createCategoryMutate.mockReset();
    updateCategoryMutate.mockReset();
    deleteCategoryMutate.mockReset();
    createAddOnMutate.mockReset();
    updateAddOnMutate.mockReset();
    deleteAddOnMutate.mockReset();
    useMenuView.mockReset();
    useMenuView.mockReturnValue({
      data: VIEW,
      isLoading: false,
      isError: false,
    });
  });

  it("lists products with their category and peso price", () => {
    renderProducts();

    const item = screen.getByTestId("admin.products.item.1");
    expect(within(item).getByText("Americano")).toBeInTheDocument();
    expect(within(item).getByText(/Hot Coffee/)).toBeInTheDocument();
    expect(within(item).getByText("₱120")).toBeInTheDocument();
  });

  it("opens the product form from the add button", async () => {
    const user = userEvent.setup();
    renderProducts();

    await user.click(screen.getByTestId("admin.products.add_button"));

    expect(screen.getByTestId("stub.product_form")).toBeInTheDocument();
  });

  it("deletes a product only after the confirmation dialog is accepted", async () => {
    const user = userEvent.setup();
    renderProducts();

    await user.click(screen.getByTestId("admin.products.delete_button.1"));
    const dialog = await screen.findByTestId("admin.products.delete_dialog");
    expect(deleteProductMutate).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByTestId("admin.products.delete_confirm_button"),
    );

    await waitFor(() => {
      expect(deleteProductMutate).toHaveBeenCalledWith(1n);
    });
  });

  it("creates a category from the new-category input", async () => {
    const user = userEvent.setup();
    renderProducts();

    await user.type(screen.getByTestId("admin.categories.name_input"), "Tea");
    await user.click(screen.getByTestId("admin.categories.add_button"));

    await waitFor(() => {
      expect(createCategoryMutate).toHaveBeenCalledWith(
        { name: "Tea", sortOrder: 2n },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it("renames a category through the inline editor", async () => {
    const user = userEvent.setup();
    renderProducts();

    await user.click(screen.getByTestId("admin.categories.rename_button.1"));
    const input = screen.getByTestId("admin.categories.rename_input.1");
    await user.clear(input);
    await user.type(input, "Brewed Coffee");
    await user.click(
      screen.getByTestId("admin.categories.rename_save_button.1"),
    );

    await waitFor(() => {
      expect(updateCategoryMutate).toHaveBeenCalledWith(
        { id: 1n, input: { name: "Brewed Coffee", sortOrder: 1n } },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it("creates an add-on with its price converted to centavos", async () => {
    const user = userEvent.setup();
    renderProducts();

    await user.type(screen.getByTestId("admin.addons.name_input"), "Oat Milk");
    await user.type(screen.getByTestId("admin.addons.price_input"), "25");
    await user.click(screen.getByTestId("admin.addons.add_button"));

    await waitFor(() => {
      expect(createAddOnMutate).toHaveBeenCalledWith(
        { name: "Oat Milk", price: 2500n, available: true },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it("toggles an add-on's availability", async () => {
    const user = userEvent.setup();
    renderProducts();

    await user.click(screen.getByTestId("admin.addons.available_switch.1"));

    await waitFor(() => {
      expect(updateAddOnMutate).toHaveBeenCalledWith({
        id: 1n,
        input: { name: "Extra Shot", price: 3000n, available: false },
      });
    });
  });
});
