import { Button } from "@/components/ui/button";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toCentavos } from "@/store/cart";
import type { CartLine } from "@/types";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartLineItemProps {
  line: CartLine;
  index: number;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (line: CartLine) => void;
}

/** Build the readable customization summary for a cart line. */
function describeCustomizations(line: CartLine): string[] {
  const parts: string[] = [];
  if (line.sizeName) parts.push(line.sizeName);
  if (line.sugarLevel) parts.push(`${line.sugarLevel} sugar`);
  if (line.iceLevel) parts.push(`${line.iceLevel} ice`);
  if (line.milkOption) parts.push(line.milkOption);
  if (line.addOnNames.length > 0) parts.push(line.addOnNames.join(", "));
  return parts;
}

export function CartLineItem({
  line,
  index,
  onQuantityChange,
  onRemove,
}: CartLineItemProps) {
  const customizations = describeCustomizations(line);
  const lineTotal = toCentavos(line.unitPrice) * BigInt(line.quantity);

  return (
    <li
      data-ocid={`cart.item.${index + 1}`}
      className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:shadow-elevated sm:p-5"
    >
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted sm:size-20">
        {line.imageUrl ? (
          <img
            src={line.imageUrl}
            alt={line.productName}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-display text-2xl font-bold text-primary/40"
          >
            {line.productName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
              {line.productName}
            </h3>
            {customizations.length > 0 ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {customizations.join(" · ")}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Served as-is</p>
            )}
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {formatPeso(line.unitPrice)} each
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid={`cart.remove_button.${index + 1}`}
            aria-label={`Remove ${line.productName} from cart`}
            onClick={() => onRemove(line)}
            className="size-9 shrink-0 rounded-full text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex items-center gap-1 rounded-full border border-border bg-background p-1"
            aria-label={`Quantity for ${line.productName}`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-ocid={`cart.decrease_button.${index + 1}`}
              aria-label={`Decrease quantity of ${line.productName}`}
              disabled={line.quantity <= 1}
              onClick={() => onQuantityChange(line.lineId, line.quantity - 1)}
              className="size-8 rounded-full transition-smooth hover:bg-secondary"
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <span
              data-ocid={`cart.quantity.${index + 1}`}
              aria-live="polite"
              className="min-w-8 text-center text-sm font-semibold tabular-nums text-foreground"
            >
              {line.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-ocid={`cart.increase_button.${index + 1}`}
              aria-label={`Increase quantity of ${line.productName}`}
              onClick={() => onQuantityChange(line.lineId, line.quantity + 1)}
              className="size-8 rounded-full transition-smooth hover:bg-secondary"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <p
            data-ocid={`cart.line_total.${index + 1}`}
            className={cn(
              "font-display text-lg font-bold tabular-nums text-foreground",
            )}
          >
            {formatPeso(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}
