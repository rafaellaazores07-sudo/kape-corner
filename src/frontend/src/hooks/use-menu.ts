import { useBackendActor } from "@/lib/backend";
import type {
  AddOn,
  AddOnInput,
  Category,
  CategoryInput,
  Id,
  Menu,
  MenuView,
  Product,
  ProductInput,
  SizeOption,
  SizeOptionInput,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const menuKeys = {
  all: ["menu"] as const,
  product: (id: Id) => ["menu", "product", String(id)] as const,
  paymentSettings: ["payment-settings"] as const,
};

/** Public storefront menu. */
export function useMenu() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Menu>({
    queryKey: menuKeys.all,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getMenu();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Menu grouped by category, with products attached to their category. */
export function useMenuView() {
  const query = useMenu();
  const data = query.data;
  const view: MenuView | undefined = data
    ? {
        categories: [...data.categories]
          .sort((a, b) => Number(a.sortOrder - b.sortOrder))
          .map((category) => ({
            ...category,
            products: data.products.filter(
              (product) => product.categoryId === category.id,
            ),
          })),
        sizes: data.sizes,
        addOns: data.addOns,
        allProducts: data.products,
      }
    : undefined;
  return { ...query, data: view };
}

/** Single product lookup. */
export function useProduct(id: Id | undefined) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product | null>({
    queryKey: menuKeys.product(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Public shop payment settings (GCash / Maya numbers and QR codes). */
export function usePaymentSettings() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: menuKeys.paymentSettings,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getPaymentSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

function useMenuInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: menuKeys.all });
  };
}

export function useCreateProduct() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createProduct(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async ({ id, input }: { id: Id; input: ProductInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateProduct(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useCreateCategory() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createCategory(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async ({ id, input }: { id: Id; input: CategoryInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateCategory(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteCategory(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useCreateSizeOption() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (input: SizeOptionInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createSizeOption(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateSizeOption() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async ({ id, input }: { id: Id; input: SizeOptionInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateSizeOption(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteSizeOption() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteSizeOption(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useCreateAddOn() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (input: AddOnInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createAddOn(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateAddOn() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async ({ id, input }: { id: Id; input: AddOnInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateAddOn(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteAddOn() {
  const { actor } = useBackendActor();
  const invalidate = useMenuInvalidation();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteAddOn(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export type { AddOn, Category, Product, SizeOption };
