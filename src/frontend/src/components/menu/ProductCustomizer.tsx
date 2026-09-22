import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { AddOn, Product, SizeOption } from "@/types";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SUGAR_LEVELS = ["0%", "25%", "50%", "75%", "100%"] as const;
const ICE_LEVELS = ["No ice", "Less ice", "Regular ice", "Extra ice"] as const;
const MILK_OPTIONS = [
  "Fresh milk",
  "Evaporated milk",
  "Oat milk",
  "Almond milk",
  "No milk",
] as const;

interface ProductCustomizerProps {
  product: Product | null;
  sizes: SizeOption[];
  addOns: AddOn[];
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductCustomizer({
  product,
  sizes,
  addOns,
  imageSrc,
  open,
  onOpenChange,
}: ProductCustomizerProps) {
  const addLine = useCartStore((state) => state.addLine);

  const productSizes = useMemo(
    () =>
      product
        ? sizes.filter((size) => product.sizeOptionIds.includes(size.id))
        : [],
    [product, sizes],
  );
  const productAddOns = useMemo(
    () =>
      product
        ? addOns.filter((addOn) => product.addOnIds.includes(addOn.id))
        : [],
    [product, addOns],
  );

  const [sizeId, setSizeId] = useState<string>("");
  const [sugarLevel, setSugarLevel] = useState<string>(SUGAR_LEVELS[2]);
  const [iceLevel, setIceLevel] = useState<string>(ICE_LEVELS[2]);
  const [milkOption, setMilkOption] = useState<string>(MILK_OPTIONS[0]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Reset the draft whenever a different product opens.
  useEffect(() => {
    if (!product) return;
    setSizeId(
      product.sizeOptionIds.length > 0 ? String(product.sizeOptionIds[0]) : "",
    );
    setSugarLevel(SUGAR_LEVELS[2]);
    setIceLevel(ICE_LEVELS[2]);
    setMilkOption(MILK_OPTIONS[0]);
    setSelectedAddOnIds([]);
    setQuantity(1);
  }, [product]);

  const selectedSize = productSizes.find((size) => String(size.id) === sizeId);
  const sizeSurcharge = selectedSize?.surcharge ?? 0n;
  const selectedAddOns = productAddOns.filter((addOn) =>
    selectedAddOnIds.includes(String(addOn.id)),
  );
  const addOnsTotal = selectedAddOns.reduce(
    (sum, addOn) => sum + addOn.price,
    0n,
  );
  const unitPrice = (product?.price ?? 0n) + sizeSurcharge + addOnsTotal;
  const lineTotal = unitPrice * BigInt(quantity);

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function handleAddToCart() {
    if (!product || !product.available) return;
    addLine({
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      quantity,
      sizeId: selectedSize?.id,
      sizeName: selectedSize?.name,
      sizeSurcharge,
      sugarLevel,
      iceLevel,
      milkOption,
      addOnIds: selectedAddOns.map((addOn) => addOn.id),
      addOnNames: selectedAddOns.map((addOn) => addOn.name),
      addOnsTotal,
      imageUrl: imageSrc,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="menu.customizer.dialog"
        className="max-h-[92vh] gap-0 overflow-y-auto rounded-2xl border-border bg-card p-0 sm:max-w-2xl"
      >
        {product && (
          <>
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <img
                src={imageSrc}
                alt={product.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-5 pt-12">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="font-display text-2xl font-bold tracking-tight text-background">
                    {product.name}
                  </DialogTitle>
                  <DialogDescription className="line-clamp-2 text-sm text-background/85">
                    {product.description}
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <div className="space-y-7 p-5 sm:p-6">
              {productSizes.length > 0 && (
                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Size
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {productSizes.map((size) => {
                      const active = String(size.id) === sizeId;
                      return (
                        <button
                          key={String(size.id)}
                          type="button"
                          data-ocid={`menu.customizer.size.${size.name.toLowerCase()}`}
                          aria-pressed={active}
                          onClick={() => setSizeId(String(size.id))}
                          className={cn(
                            "flex flex-col items-center gap-0.5 rounded-xl border px-3 py-3 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                            active
                              ? "border-accent bg-accent/15 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-accent/50",
                          )}
                        >
                          <span>{size.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {size.surcharge > 0n
                              ? `+${formatPeso(size.surcharge)}`
                              : "Included"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Sugar level
                </legend>
                <RadioGroup
                  value={sugarLevel}
                  onValueChange={setSugarLevel}
                  className="flex flex-wrap gap-2"
                >
                  {SUGAR_LEVELS.map((level) => (
                    <Label
                      key={level}
                      htmlFor={`sugar-${level}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-smooth",
                        sugarLevel === level
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-accent/50",
                      )}
                    >
                      <RadioGroupItem
                        id={`sugar-${level}`}
                        value={level}
                        data-ocid={`menu.customizer.sugar.${level.replace("%", "")}`}
                        className="sr-only"
                      />
                      {level}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Ice level
                </legend>
                <RadioGroup
                  value={iceLevel}
                  onValueChange={setIceLevel}
                  className="flex flex-wrap gap-2"
                >
                  {ICE_LEVELS.map((level) => (
                    <Label
                      key={level}
                      htmlFor={`ice-${level}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-smooth",
                        iceLevel === level
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-accent/50",
                      )}
                    >
                      <RadioGroupItem
                        id={`ice-${level}`}
                        value={level}
                        data-ocid={`menu.customizer.ice.${level.toLowerCase().replace(/\s+/g, "_")}`}
                        className="sr-only"
                      />
                      {level}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Milk option
                </legend>
                <RadioGroup
                  value={milkOption}
                  onValueChange={setMilkOption}
                  className="flex flex-wrap gap-2"
                >
                  {MILK_OPTIONS.map((option) => (
                    <Label
                      key={option}
                      htmlFor={`milk-${option}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-smooth",
                        milkOption === option
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-accent/50",
                      )}
                    >
                      <RadioGroupItem
                        id={`milk-${option}`}
                        value={option}
                        data-ocid={`menu.customizer.milk.${option.toLowerCase().replace(/\s+/g, "_")}`}
                        className="sr-only"
                      />
                      {option}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>

              {productAddOns.length > 0 && (
                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Add-ons
                  </legend>
                  <div className="space-y-2">
                    {productAddOns.map((addOn) => {
                      const id = String(addOn.id);
                      const checked = selectedAddOnIds.includes(id);
                      return (
                        <label
                          key={id}
                          htmlFor={`addon-${id}`}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-smooth",
                            checked
                              ? "border-accent bg-accent/10"
                              : "border-border bg-background hover:border-accent/50",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              id={`addon-${id}`}
                              type="checkbox"
                              data-ocid={`menu.customizer.addon.${addOn.name.toLowerCase().replace(/\s+/g, "_")}`}
                              checked={checked}
                              onChange={() => toggleAddOn(id)}
                              className="size-4 accent-accent"
                            />
                            <span className="text-sm font-medium text-foreground">
                              {addOn.name}
                            </span>
                          </span>
                          <span className="text-sm font-semibold text-accent">
                            +{formatPeso(addOn.price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Quantity
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    data-ocid="menu.customizer.quantity_decrease"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="size-11 rounded-full border-border"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </Button>
                  <span
                    data-ocid="menu.customizer.quantity_value"
                    className="min-w-10 text-center font-display text-xl font-bold text-foreground"
                  >
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    data-ocid="menu.customizer.quantity_increase"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((value) => Math.min(99, value + 1))
                    }
                    className="size-11 rounded-full border-border"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Base price</span>
                  <span>{formatPeso(product.price)}</span>
                </div>
                {sizeSurcharge > 0n && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Size · {selectedSize?.name}</span>
                    <span>+{formatPeso(sizeSurcharge)}</span>
                  </div>
                )}
                {addOnsTotal > 0n && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Add-ons ({selectedAddOns.length})</span>
                    <span>+{formatPeso(addOnsTotal)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-semibold text-foreground">
                    {quantity > 1
                      ? `${formatPeso(unitPrice)} × ${quantity}`
                      : "Total"}
                  </span>
                  <span
                    data-ocid="menu.customizer.total"
                    className="font-display text-2xl font-bold text-accent"
                  >
                    {formatPeso(lineTotal)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="menu.customizer.cancel_button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border-border sm:w-32"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  data-ocid="menu.customizer.add_to_cart_button"
                  disabled={!product.available}
                  onClick={handleAddToCart}
                  className="flex-1 rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {product.available
                    ? `Add to Cart · ${formatPeso(lineTotal)}`
                    : "Sold out"}
                </Button>
              </div>

              {!product.available && (
                <Badge
                  data-ocid="menu.customizer.sold_out_state"
                  className="w-full justify-center rounded-full border-transparent bg-foreground/85 py-2 text-xs font-semibold uppercase tracking-wider text-background"
                >
                  This item is currently sold out
                </Badge>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
