import { Separator } from "@/components/ui/separator";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartTotals } from "@/types";
import type { ReactNode } from "react";

interface OrderSummaryProps {
  totals: CartTotals;
  /** Optional footer content, e.g. the checkout call to action. */
  children?: ReactNode;
  className?: string;
}

/** Subtotal / service fee / total breakdown in Philippine Peso. */
export function OrderSummary({
  totals,
  children,
  className,
}: OrderSummaryProps) {
  return (
    <section
      data-ocid="cart.summary"
      aria-labelledby="order-summary-heading"
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6",
        className,
      )}
    >
      <h2
        id="order-summary-heading"
        className="font-display text-xl font-bold tracking-tight text-foreground"
      >
        Order Summary
      </h2>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">
            Subtotal
            <span className="ml-1.5 text-xs">
              ({totals.itemCount} {totals.itemCount === 1 ? "item" : "items"})
            </span>
          </dt>
          <dd
            data-ocid="cart.subtotal"
            className="font-medium tabular-nums text-foreground"
          >
            {formatPeso(totals.subtotal)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Service Fee</dt>
          <dd
            data-ocid="cart.service_fee"
            className="font-medium tabular-nums text-foreground"
          >
            {formatPeso(totals.serviceFee)}
          </dd>
        </div>

        <Separator className="my-1" />

        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-display text-base font-bold text-foreground">
            Total
          </dt>
          <dd
            data-ocid="cart.total"
            className="font-display text-2xl font-bold tabular-nums text-accent"
          >
            {formatPeso(totals.total)}
          </dd>
        </div>
      </dl>

      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
