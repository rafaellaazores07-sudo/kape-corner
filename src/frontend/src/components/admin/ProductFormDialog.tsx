import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { storedFileBlob, storedFileFromFile } from "@/lib/backend";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AddOn,
  Category,
  Product,
  ProductInput,
  SizeOption,
} from "@/types";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing product when editing, undefined when creating. */
  product?: Product;
  categories: Category[];
  addOns: AddOn[];
  sizes: SizeOption[];
  isPending: boolean;
  onSubmit: (input: ProductInput) => void;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  available: boolean;
  addOnIds: string[];
  sizeOptionIds: string[];
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  available: true,
  addOnIds: [],
  sizeOptionIds: [],
};

function toFormState(product: Product): FormState {
  return {
    name: product.name,
    description: product.description,
    price: (Number(product.price) / 100).toFixed(2),
    categoryId: String(product.categoryId),
    available: product.available,
    addOnIds: product.addOnIds.map(String),
    sizeOptionIds: product.sizeOptionIds.map(String),
  };
}

function toggleId(list: string[], id: string): string[] {
  return list.includes(id)
    ? list.filter((entry) => entry !== id)
    : [...list, id];
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  addOns,
  sizes,
  isPending,
  onSubmit,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-seed the draft only when the dialog opens for a different record.
  useEffect(() => {
    if (!open) return;
    setForm(product ? toFormState(product) : EMPTY_FORM);
    setImageFile(null);
    setImagePreview(
      product?.image ? storedFileBlob(product.image).getDirectURL() : null,
    );
    setError(null);
  }, [open, product]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const pricePesos = Number.parseFloat(form.price);
    if (!form.name.trim()) {
      setError("Give the product a name.");
      return;
    }
    if (!form.categoryId) {
      setError("Choose a category for this product.");
      return;
    }
    if (!Number.isFinite(pricePesos) || pricePesos < 0) {
      setError("Enter a valid price in pesos.");
      return;
    }

    let image: ProductInput["image"];
    if (imageFile) {
      image = await storedFileFromFile(imageFile);
    } else if (product?.image) {
      image = product.image;
    }

    setError(null);
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: BigInt(Math.round(pricePesos * 100)),
      categoryId: BigInt(form.categoryId),
      available: form.available,
      addOnIds: form.addOnIds.map((id) => BigInt(id)),
      sizeOptionIds: form.sizeOptionIds.map((id) => BigInt(id)),
      image,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="admin.product.dialog"
        className="max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold tracking-tight">
            {product ? "Edit product" : "Add a product"}
          </DialogTitle>
          <DialogDescription>
            Set the name, price, category, and availability. Prices are entered
            in Philippine Peso.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              data-ocid="admin.product.name_input"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="e.g. Spanish Latte"
              className="rounded-xl border-input bg-background"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              data-ocid="admin.product.description_input"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Short, appetizing description customers will read on the menu."
              rows={3}
              className="rounded-xl border-input bg-background"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="product-price">Price (₱)</Label>
              <Input
                id="product-price"
                data-ocid="admin.product.price_input"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="150.00"
                className="rounded-xl border-input bg-background"
              />
              {form.price && Number.isFinite(Number(form.price)) && (
                <p className="text-xs text-muted-foreground">
                  Displays as{" "}
                  {formatPeso(BigInt(Math.round(Number(form.price) * 100)))}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-category">Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger
                  id="product-category"
                  data-ocid="admin.product.category_select"
                  className="w-full rounded-xl border-input bg-background"
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={String(category.id)}
                      value={String(category.id)}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Product image</Label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative size-24 overflow-hidden rounded-xl border border-border bg-muted">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <ImagePlus className="size-6" aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="admin.product.upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border-border transition-smooth hover:bg-secondary"
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  {imagePreview ? "Replace image" : "Upload image"}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    data-ocid="admin.product.remove_image_button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-full text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" aria-hidden="true" />
                    Remove image
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="product-available">Available for ordering</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to hide this item from the storefront.
              </p>
            </div>
            <Switch
              id="product-available"
              data-ocid="admin.product.available_switch"
              checked={form.available}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, available: checked }))
              }
            />
          </div>

          {sizes.length > 0 && (
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-foreground">
                Size options
              </legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const id = String(size.id);
                  const active = form.sizeOptionIds.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      data-ocid={`admin.product.size_toggle.${id}`}
                      aria-pressed={active}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          sizeOptionIds: toggleId(prev.sizeOptionIds, id),
                        }))
                      }
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth",
                        active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {size.name} · +{formatPeso(size.surcharge)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {addOns.length > 0 && (
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-foreground">
                Add-ons
              </legend>
              <div className="flex flex-wrap gap-2">
                {addOns.map((addOn) => {
                  const id = String(addOn.id);
                  const active = form.addOnIds.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      data-ocid={`admin.product.addon_toggle.${id}`}
                      aria-pressed={active}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          addOnIds: toggleId(prev.addOnIds, id),
                        }))
                      }
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {addOn.name} · +{formatPeso(addOn.price)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {error && (
            <p
              data-ocid="admin.product.error_state"
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.product.cancel_button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border-border transition-smooth hover:bg-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="admin.product.save_button"
            disabled={isPending}
            onClick={() => void handleSubmit()}
            className="rounded-full bg-accent text-accent-foreground transition-smooth hover:bg-accent/90"
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {product ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
