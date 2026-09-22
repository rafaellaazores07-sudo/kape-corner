import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  imageSrc: string;
  /** Lowest size surcharge in centavos, used for the "from" price hint. */
  minSurcharge: bigint;
  onSelect: (product: Product) => void;
  index: number;
}

export function ProductCard({
  product,
  imageSrc,
  minSurcharge,
  onSelect,
  index,
}: ProductCardProps) {
  const soldOut = !product.available;
  const hasSizes = product.sizeOptionIds.length > 0;
  const fromPrice = product.price + minSurcharge;

  return (
    <article
      data-ocid={`menu.product.card.${index + 1}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-1 hover:shadow-elevated",
        soldOut && "opacity-80",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          className={cn(
            "size-full object-cover transition-smooth duration-500 group-hover:scale-105",
            soldOut && "grayscale",
          )}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {soldOut ? (
            <Badge
              data-ocid={`menu.product.sold_out_badge.${index + 1}`}
              className="rounded-full border-transparent bg-foreground/85 text-[0.6875rem] font-semibold uppercase tracking-wider text-background"
            >
              Sold out
            </Badge>
          ) : (
            <Badge className="rounded-full border-transparent bg-accent text-[0.6875rem] font-semibold uppercase tracking-wider text-accent-foreground">
              Available
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="min-w-0">
            {hasSizes && (
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                From
              </p>
            )}
            <p className="font-display text-xl font-bold text-accent">
              {formatPeso(hasSizes ? fromPrice : product.price)}
            </p>
          </div>

          <Button
            type="button"
            data-ocid={`menu.product.add_button.${index + 1}`}
            disabled={soldOut}
            onClick={() => onSelect(product)}
            className="shrink-0 rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="size-4" aria-hidden="true" />
            {soldOut ? "Sold out" : "Add"}
          </Button>
        </div>
      </div>
    </article>
  );
}
