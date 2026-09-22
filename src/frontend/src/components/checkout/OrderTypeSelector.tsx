import { cn } from "@/lib/utils";
import { OrderType } from "@/types";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";

interface OrderTypeSelectorProps {
  value?: OrderType;
  onChange: (orderType: OrderType) => void;
  error?: string;
}

const OPTIONS = [
  {
    value: OrderType.dineIn,
    label: "Dine-In",
    description: "Enjoy your drink at our café",
    icon: UtensilsCrossed,
  },
  {
    value: OrderType.takeOut,
    label: "Take-Out",
    description: "Pick it up and go",
    icon: ShoppingBag,
  },
] as const;

/** Required first step of checkout: dine-in or take-out. */
export function OrderTypeSelector({
  value,
  onChange,
  error,
}: OrderTypeSelectorProps) {
  return (
    <fieldset data-ocid="checkout.order_type">
      <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        How would you like your order?
      </legend>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              data-ocid={`checkout.order_type.${option.value}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-smooth",
                selected
                  ? "border-accent bg-accent/10 shadow-subtle"
                  : "border-border bg-card hover:border-accent/50 hover:bg-secondary/40",
              )}
            >
              <input
                type="radio"
                name="orderType"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full transition-smooth",
                  selected
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-bold tracking-tight text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p
          data-ocid="checkout.order_type.error"
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
