import { Button } from "@/components/ui/button";
import { formatDateTime, formatPeso, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type Order, OrderStatus, OrderType, PaymentMethod } from "@/types";
import { Coffee, Printer } from "lucide-react";

const SHOP_NAME = "Kape Corner";
const SHOP_TAGLINE = "Brewed in the Philippines";
const SHOP_ADDRESS =
  "128 Katipunan Avenue, Loyola Heights, Quezon City, Metro Manila";
const SHOP_CONTACT = "0917 555 0142 · hello@kapecorner.ph";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: "Cash on Pickup",
  [PaymentMethod.gcash]: "GCash",
  [PaymentMethod.maya]: "Maya",
};

function orderTypeLabel(order: Order): string {
  if (order.orderType === OrderType.dineIn) {
    const table = order.dineIn?.tableNumber;
    return table ? `Dine In · Table ${table}` : "Dine In";
  }
  const pickup = order.takeOut?.pickupTime;
  return pickup ? `Take Out · ${pickup}` : "Take Out";
}

interface ReceiptProps {
  order: Order;
  className?: string;
}

export function Receipt({ order, className }: ReceiptProps) {
  const isConfirmed = order.status !== OrderStatus.orderReceived;
  const reference = order.payment.referenceNumber?.trim();

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Your Receipt
          </h2>
          <p className="text-sm text-muted-foreground">
            {isConfirmed
              ? "Keep this for your records or print a copy."
              : "Your receipt becomes available once payment is verified."}
          </p>
        </div>
        <Button
          type="button"
          data-ocid="receipt.print_button"
          onClick={() => window.print()}
          className="rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
        >
          <Printer className="size-4" aria-hidden="true" />
          Print Receipt
        </Button>
      </div>

      <article
        data-ocid="receipt.card"
        className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-subtle print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        <header className="flex flex-col items-center gap-2 border-b border-dashed border-border pb-5 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground print:bg-transparent print:text-foreground">
            <Coffee className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">
              {SHOP_NAME}
            </p>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {SHOP_TAGLINE}
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {SHOP_ADDRESS}
            <br />
            {SHOP_CONTACT}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-dashed border-border py-5 text-sm">
          <div className="col-span-2">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Order Number
            </p>
            <p
              data-ocid="receipt.order_number"
              className="font-mono text-lg font-bold tracking-tight text-foreground"
            >
              {order.orderNumber}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Date &amp; Time
            </p>
            <p className="font-medium text-foreground">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Order Type
            </p>
            <p className="font-medium text-foreground">
              {orderTypeLabel(order)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Customer
            </p>
            <p className="font-medium text-foreground">
              {order.customer.fullName}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.customer.mobileNumber}
              {order.customer.email ? ` · ${order.customer.email}` : ""}
            </p>
          </div>
        </section>

        <section className="border-b border-dashed border-border py-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="pb-2 text-left font-semibold">
                  Item
                </th>
                <th scope="col" className="pb-2 text-center font-semibold">
                  Qty
                </th>
                <th scope="col" className="pb-2 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr
                  key={`${item.productId}-${index}`}
                  data-ocid={`receipt.item.${index + 1}`}
                  className="border-t border-border/60 align-top"
                >
                  <td className="py-2.5 pr-2">
                    <p className="font-medium text-foreground">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPeso(item.unitPrice)} each
                    </p>
                  </td>
                  <td className="py-2.5 text-center text-muted-foreground">
                    {String(item.quantity)}
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums text-foreground">
                    {formatPeso(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-2 border-b border-dashed border-border py-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums text-foreground">
              {formatPeso(order.subtotal)}
            </span>
          </div>
          {order.serviceFee > 0n && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="tabular-nums text-foreground">
                {formatPeso(order.serviceFee)}
              </span>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <span className="font-display text-base font-bold text-foreground">
              Total
            </span>
            <span
              data-ocid="receipt.total"
              className="font-display text-xl font-bold tabular-nums text-accent-foreground"
            >
              {formatPeso(order.total)}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-x-4 gap-y-3 py-5 text-sm">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Method
            </p>
            <p className="font-medium text-foreground">
              {PAYMENT_LABELS[order.payment.method] ??
                humanize(order.payment.method)}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Reference No.
            </p>
            <p
              data-ocid="receipt.reference_number"
              className="font-mono font-medium text-foreground"
            >
              {reference || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <p className="font-medium text-foreground">
              {humanize(order.status)}
            </p>
          </div>
        </section>

        {order.specialInstructions.trim() && (
          <section className="border-t border-dashed border-border pt-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Special Instructions
            </p>
            <p className="mt-1 text-sm text-foreground">
              {order.specialInstructions}
            </p>
          </section>
        )}

        <footer className="mt-5 border-t border-dashed border-border pt-5 text-center">
          <p className="font-display text-base font-semibold text-foreground">
            Salamat, {order.customer.fullName.split(" ")[0]}!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This receipt is your proof of order. Present your order number at
            the counter.
          </p>
        </footer>
      </article>
    </div>
  );
}
