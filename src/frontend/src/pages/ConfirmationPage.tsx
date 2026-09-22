import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/use-orders";
import { formatDateTime, formatPeso, humanize } from "@/lib/format";
import type { Order, OrderItem, OrderStatus } from "@/types";
import { OrderType, PaymentMethod } from "@/types";
import { Link, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Coffee,
  MapPin,
  Receipt,
  Smartphone,
  Store,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

const STATUS_STYLES: Record<OrderStatus, string> = {
  orderReceived: "bg-secondary text-secondary-foreground",
  paymentVerification: "bg-warning/20 text-warning-foreground",
  orderConfirmed: "bg-accent/15 text-accent-foreground",
  preparing: "bg-accent/15 text-accent-foreground",
  readyForPickup: "bg-success/15 text-success",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  gcash: "GCash",
  maya: "Maya",
  cash: "Cash",
};

const PAYMENT_ICONS = {
  gcash: Smartphone,
  maya: Wallet,
  cash: Banknote,
} as const;

function customizationSummary(item: OrderItem): string {
  const parts = [
    item.customization.sugarLevel,
    item.customization.iceLevel,
    item.customization.milkOption,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : "Standard preparation";
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">{children}</span>
      </div>
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  const PaymentIcon = PAYMENT_ICONS[order.payment.method];
  const isTakeOut = order.orderType === OrderType.takeOut;

  return (
    <div className="flex flex-col gap-8">
      <div
        data-ocid="confirmation.success_state"
        className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-subtle md:px-10"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Order placed
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Salamat, {order.customer.fullName.split(" ")[0] || "kaibigan"}!
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            We've received your order and our baristas are on it. Keep your
            order number handy when you pick up.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-accent/40 bg-accent/5 px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Order number
          </span>
          <span
            data-ocid="confirmation.order_number"
            className="font-mono text-xl font-bold tracking-tight text-primary md:text-2xl"
          >
            {order.orderNumber}
          </span>
          <span
            data-ocid="confirmation.status_badge"
            className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
          >
            {humanize(order.status)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex flex-col gap-6">
          <section
            data-ocid="confirmation.items.panel"
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Your order
              </h2>
              <span className="text-sm text-muted-foreground">
                {order.items.reduce(
                  (sum, item) => sum + Number(item.quantity),
                  0,
                )}{" "}
                items
              </span>
            </div>

            <ul className="flex flex-col divide-y divide-border">
              {order.items.map((item, index) => (
                <li
                  key={`${String(item.productId)}-${index}`}
                  data-ocid={`confirmation.item.${index + 1}`}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-medium text-foreground">
                      {Number(item.quantity)}× {item.productName}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {customizationSummary(item)}
                    </span>
                    {item.customization.addOnIds.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {item.customization.addOnIds.length} add-on
                        {item.customization.addOnIds.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 font-medium tabular-nums text-foreground">
                    {formatPeso(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPeso(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Service fee</dt>
                <dd className="tabular-nums">{formatPeso(order.serviceFee)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="font-display text-base font-bold">
                  Total amount
                </dt>
                <dd
                  data-ocid="confirmation.total"
                  className="font-display text-xl font-bold text-primary tabular-nums"
                >
                  {formatPeso(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          {order.specialInstructions && (
            <section
              data-ocid="confirmation.notes.panel"
              className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary/40 p-5"
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Special instructions
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {order.specialInstructions}
              </p>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <section
            data-ocid="confirmation.details.panel"
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6"
          >
            <h2 className="font-display text-lg font-bold tracking-tight">
              Order details
            </h2>
            <div className="flex flex-col gap-4">
              <DetailRow icon={Receipt} label="Customer">
                {order.customer.fullName}
              </DetailRow>
              <DetailRow icon={Clock} label="Placed on">
                {formatDateTime(order.createdAt)}
              </DetailRow>
              <DetailRow
                icon={isTakeOut ? Store : UtensilsCrossed}
                label="Order type"
              >
                {isTakeOut ? "Take-out" : "Dine-in"}
                {isTakeOut && order.takeOut?.pickupTime
                  ? ` · pickup ${order.takeOut.pickupTime}`
                  : ""}
                {!isTakeOut && order.dineIn
                  ? ` · table ${order.dineIn.tableNumber || "—"}`
                  : ""}
              </DetailRow>
              <DetailRow icon={PaymentIcon} label="Payment method">
                {PAYMENT_LABELS[order.payment.method]}
              </DetailRow>
              {order.payment.referenceNumber && (
                <DetailRow icon={Receipt} label="Reference number">
                  <span className="font-mono">
                    {order.payment.referenceNumber}
                  </span>
                </DetailRow>
              )}
              {order.payment.proof && (
                <DetailRow icon={Receipt} label="Proof of payment">
                  {order.payment.proof.filename}
                </DetailRow>
              )}
            </div>
          </section>

          <section
            data-ocid="confirmation.next_steps.panel"
            className="flex flex-col gap-4 rounded-2xl border border-border bg-secondary/40 p-5"
          >
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" aria-hidden="true" />
              <h2 className="font-display text-base font-bold tracking-tight">
                What happens next
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {order.payment.method === PaymentMethod.cash
                ? "Pay in cash at the counter when you pick up. We'll call your order number when it's ready."
                : "We'll verify your payment reference, then start preparing your drinks. You can follow along on the tracking page."}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="h-11 w-full rounded-full bg-accent font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
              >
                <Link to="/track" data-ocid="confirmation.track_button">
                  Track this order
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 w-full rounded-full border-border font-semibold transition-smooth hover:bg-secondary"
              >
                <Link to="/menu" data-ocid="confirmation.order_again_button">
                  Order something else
                </Link>
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function ConfirmationPage() {
  const { order: orderNumber } = useSearch({ from: "/confirmation" });
  const { data: order, isLoading, isError } = useOrder(orderNumber);

  if (!orderNumber) {
    return (
      <section
        data-ocid="confirmation.page"
        className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Receipt className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          No order selected
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          We don't have an order number to show. Place an order or look one up
          from the tracking page.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="rounded-full bg-accent font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90"
          >
            <Link to="/menu" data-ocid="confirmation.empty_state.menu_button">
              Browse the menu
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-border font-semibold transition-smooth hover:bg-secondary"
          >
            <Link to="/track" data-ocid="confirmation.empty_state.track_button">
              Track an order
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section
        data-ocid="confirmation.page"
        className="container flex flex-col gap-8 py-10 md:py-14"
      >
        <div
          data-ocid="confirmation.loading_state"
          className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-10"
        >
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-16 w-56 rounded-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (isError || !order) {
    return (
      <section
        data-ocid="confirmation.page"
        className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Coffee className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          We couldn't find that order
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Order {orderNumber} isn't showing up. Double-check the number or try
          tracking it again.
        </p>
        <Button
          asChild
          className="rounded-full bg-accent font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90"
        >
          <Link to="/track" data-ocid="confirmation.error_state.track_button">
            Track an order
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section
      data-ocid="confirmation.page"
      className="bg-background py-10 md:py-14"
    >
      <div className="container">
        <OrderDetails order={order} />
      </div>
    </section>
  );
}
