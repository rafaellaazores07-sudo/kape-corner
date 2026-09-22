import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useCreateAddOn,
  useCreateCategory,
  useCreateProduct,
  useDeleteAddOn,
  useDeleteCategory,
  useDeleteProduct,
  useMenuView,
  useUpdateAddOn,
  useUpdateCategory,
  useUpdateProduct,
} from "@/hooks/use-menu";
import { storedFileBlob } from "@/lib/backend";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AddOn, Category, Product, ProductInput } from "@/types";
import { Coffee, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-subtle">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border">
        <div className="space-y-1">
          <CardTitle className="font-display text-lg font-bold tracking-tight">
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function ProductRow({
  product,
  categoryName,
  index,
  onEdit,
  onDelete,
}: {
  product: Product;
  categoryName: string;
  index: number;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <li
      data-ocid={`admin.products.item.${index + 1}`}
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-4"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {product.image ? (
          <img
            src={storedFileBlob(product.image).getDirectURL()}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <Coffee className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground">
            {product.name}
          </p>
          <Badge
            variant={product.available ? "secondary" : "outline"}
            className={cn(
              "rounded-full text-[0.6875rem] font-semibold uppercase tracking-wider",
              product.available
                ? "border-transparent bg-success/15 text-success"
                : "border-border text-muted-foreground",
            )}
          >
            {product.available ? "Available" : "Unavailable"}
          </Badge>
        </div>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {categoryName} · {product.description || "No description"}
        </p>
      </div>

      <p className="font-display text-lg font-bold text-accent">
        {formatPeso(product.price)}
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid={`admin.products.edit_button.${index + 1}`}
          onClick={() => onEdit(product)}
          className="rounded-full border-border transition-smooth hover:bg-secondary"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid={`admin.products.delete_button.${index + 1}`}
          onClick={() => onDelete(product)}
          className="rounded-full border-border text-destructive transition-smooth hover:bg-destructive/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </li>
  );
}

export function ProductsTab() {
  const menuQuery = useMenuView();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createAddOn = useCreateAddOn();
  const updateAddOn = useUpdateAddOn();
  const deleteAddOn = useDeleteAddOn();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [addOnName, setAddOnName] = useState("");
  const [addOnPrice, setAddOnPrice] = useState("");

  const view = menuQuery.data;
  const categories = view?.categories ?? [];
  const addOns = view?.addOns ?? [];
  const sizes = view?.sizes ?? [];
  const products = view?.allProducts ?? [];

  const categoryNameById = new Map(
    categories.map((category) => [String(category.id), category.name]),
  );

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  const handleSubmit = (input: ProductInput) => {
    if (editing) {
      updateProduct.mutate(
        { id: editing.id, input },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createProduct.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleAddCategory = () => {
    const name = categoryName.trim();
    if (!name) return;
    createCategory.mutate(
      { name, sortOrder: BigInt(categories.length) },
      { onSuccess: () => setCategoryName("") },
    );
  };

  const startRenameCategory = (category: Category) => {
    setEditingCategoryId(String(category.id));
    setEditingCategoryName(category.name);
  };

  const cancelRenameCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleRenameCategory = (category: Category) => {
    const name = editingCategoryName.trim();
    if (!name || name === category.name) {
      cancelRenameCategory();
      return;
    }
    updateCategory.mutate(
      { id: category.id, input: { name, sortOrder: category.sortOrder } },
      { onSuccess: () => cancelRenameCategory() },
    );
  };

  const handleAddAddOn = () => {
    const name = addOnName.trim();
    const price = Number.parseFloat(addOnPrice);
    if (!name || !Number.isFinite(price) || price < 0) return;
    createAddOn.mutate(
      { name, price: BigInt(Math.round(price * 100)), available: true },
      {
        onSuccess: () => {
          setAddOnName("");
          setAddOnPrice("");
        },
      },
    );
  };

  if (menuQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => `products-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-24 rounded-2xl" />
          ),
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Products"
        description="Add, edit, and retire the drinks and food on your menu."
        action={
          <Button
            type="button"
            data-ocid="admin.products.add_button"
            onClick={openCreate}
            className="shrink-0 rounded-full bg-accent text-accent-foreground transition-smooth hover:bg-accent/90"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add product
          </Button>
        }
      >
        {products.length === 0 ? (
          <div
            data-ocid="admin.products.empty_state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Coffee className="size-5" aria-hidden="true" />
            </span>
            <p className="font-medium text-foreground">No products yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add your first drink to start taking orders from the storefront.
            </p>
            <Button
              type="button"
              data-ocid="admin.products.empty_add_button"
              onClick={openCreate}
              className="rounded-full bg-accent text-accent-foreground transition-smooth hover:bg-accent/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add product
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {products.map((product, index) => (
              <ProductRow
                key={String(product.id)}
                product={product}
                index={index}
                categoryName={
                  categoryNameById.get(String(product.categoryId)) ??
                  "Uncategorized"
                }
                onEdit={openEdit}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Categories"
          description="Group products into menu sections."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid min-w-[12rem] flex-1 gap-2">
                <Label htmlFor="new-category">New category</Label>
                <Input
                  id="new-category"
                  data-ocid="admin.categories.name_input"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="e.g. Iced Coffee"
                  className="rounded-xl border-input bg-background"
                />
              </div>
              <Button
                type="button"
                data-ocid="admin.categories.add_button"
                disabled={createCategory.isPending || !categoryName.trim()}
                onClick={handleAddCategory}
                className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add
              </Button>
            </div>

            {categories.length === 0 ? (
              <p
                data-ocid="admin.categories.empty_state"
                className="text-sm text-muted-foreground"
              >
                No categories yet. Add one to organize your menu.
              </p>
            ) : (
              <ul className="space-y-2">
                {categories.map((category: Category, index: number) => {
                  const isRenaming = editingCategoryId === String(category.id);
                  return (
                    <li
                      key={String(category.id)}
                      data-ocid={`admin.categories.item.${index + 1}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                    >
                      {isRenaming ? (
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Input
                            aria-label={`Rename ${category.name}`}
                            data-ocid={`admin.categories.rename_input.${index + 1}`}
                            value={editingCategoryName}
                            onChange={(event) =>
                              setEditingCategoryName(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleRenameCategory(category);
                              }
                              if (event.key === "Escape") {
                                cancelRenameCategory();
                              }
                            }}
                            className="h-9 rounded-xl border-input bg-background"
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              updateCategory.isPending ||
                              !editingCategoryName.trim()
                            }
                            data-ocid={`admin.categories.rename_save_button.${index + 1}`}
                            onClick={() => handleRenameCategory(category)}
                            className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            data-ocid={`admin.categories.rename_cancel_button.${index + 1}`}
                            onClick={cancelRenameCategory}
                            className="rounded-full text-muted-foreground transition-smooth hover:text-foreground"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate text-sm font-medium text-foreground">
                            {category.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Rename ${category.name}`}
                              data-ocid={`admin.categories.rename_button.${index + 1}`}
                              onClick={() => startRenameCategory(category)}
                              className="rounded-full text-muted-foreground transition-smooth hover:text-foreground"
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${category.name}`}
                              data-ocid={`admin.categories.delete_button.${index + 1}`}
                              onClick={() => deleteCategory.mutate(category.id)}
                              className="rounded-full text-muted-foreground transition-smooth hover:text-destructive"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Add-ons"
          description="Extras customers can add to any drink."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid min-w-[10rem] flex-1 gap-2">
                <Label htmlFor="new-addon">New add-on</Label>
                <Input
                  id="new-addon"
                  data-ocid="admin.addons.name_input"
                  value={addOnName}
                  onChange={(event) => setAddOnName(event.target.value)}
                  placeholder="e.g. Extra shot"
                  className="rounded-xl border-input bg-background"
                />
              </div>
              <div className="grid w-28 gap-2">
                <Label htmlFor="new-addon-price">Price (₱)</Label>
                <Input
                  id="new-addon-price"
                  data-ocid="admin.addons.price_input"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={addOnPrice}
                  onChange={(event) => setAddOnPrice(event.target.value)}
                  placeholder="20"
                  className="rounded-xl border-input bg-background"
                />
              </div>
              <Button
                type="button"
                data-ocid="admin.addons.add_button"
                disabled={
                  createAddOn.isPending ||
                  !addOnName.trim() ||
                  !Number.isFinite(Number.parseFloat(addOnPrice))
                }
                onClick={handleAddAddOn}
                className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add
              </Button>
            </div>

            {addOns.length === 0 ? (
              <p
                data-ocid="admin.addons.empty_state"
                className="text-sm text-muted-foreground"
              >
                No add-ons yet. Add extras like extra shots or oat milk.
              </p>
            ) : (
              <ul className="space-y-2">
                {addOns.map((addOn: AddOn, index: number) => (
                  <li
                    key={String(addOn.id)}
                    data-ocid={`admin.addons.item.${index + 1}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {addOn.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{formatPeso(addOn.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        aria-label={`${addOn.name} availability`}
                        data-ocid={`admin.addons.available_switch.${index + 1}`}
                        checked={addOn.available}
                        onCheckedChange={(checked) =>
                          updateAddOn.mutate({
                            id: addOn.id,
                            input: {
                              name: addOn.name,
                              price: addOn.price,
                              available: checked,
                            },
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${addOn.name}`}
                        data-ocid={`admin.addons.delete_button.${index + 1}`}
                        onClick={() => deleteAddOn.mutate(addOn.id)}
                        className="rounded-full text-muted-foreground transition-smooth hover:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionCard>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        categories={categories}
        addOns={addOns}
        sizes={sizes}
        isPending={createProduct.isPending || updateProduct.isPending}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent
          data-ocid="admin.products.delete_dialog"
          className="rounded-2xl border-border bg-card"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-bold tracking-tight">
              Delete this product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.name}" will be removed from the menu. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.products.delete_cancel_button"
              className="rounded-full border-border"
            >
              Keep product
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.products.delete_confirm_button"
              onClick={() => {
                if (pendingDelete) deleteProduct.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
