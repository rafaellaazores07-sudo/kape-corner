import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { Receipt } from "@/components/orders/Receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/use-orders";
import { formatDateTime, formatPeso, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coffee,
  PackageSearch,
  ReceiptText,
  Search,
} from "lucide-react";
import { type FormEvent, useState } from "react";

const STATUS_TONE: Record<OrderStatus, string> = {
  [OrderStatus.orderReceived]: "bg-secondary text-secondary-foreground",
  [OrderStatus.paymentVerification]: "bg-warning/20 text-warning-foreground",
  [OrderStatus.orderConfirmed]: "bg-accent/20 text-accent-foreground",
  [OrderStatus.preparing]: "bg-accent/20 text-accent-foreground",
  [OrderStatus.readyForPickup]: "bg-success/20 text-success-foreground",
  [OrderStatus.completed]: "bg-success/20 text-success-foreground",
  [OrderStatus.cancelled]: "bg-destructive/15 text-destructive",
};

export function TrackOrderPage() {
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState("");

  const {
    data: order,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useOrder(submitted || undefined);

  const hasSearched = submitted.length > 0;
  const notFound = hasSearched && !isLoading && !isError && !order;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft.trim().toUpperCase();
    if (!value) return;
    setSubmitted(value);
  }

  return (
    <div className="bg-gradient-warm">
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Kape Corner
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
            Track your order
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Enter the order number from your confirmation and we&apos;ll show
            you exactly where your cup is in the queue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          data-ocid="track.form"
          className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Label
              htmlFor="order-number"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Order number
            </Label>
            <Input
              id="order-number"
              data-ocid="track.order_number_input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="e.g. ORDER #20260922-001"
              autoComplete="off"
              spellCheck={false}
              className="h-12 rounded-full border-input bg-card px-5 font-mono text-base uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            data-ocid="track.submit_button"
            disabled={draft.trim().length === 0 || isFetching}
            className="h-12 shrink-0 rounded-full bg-accent px-7 text-base text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
          >
            <Search className="size-4" aria-hidden="true" />
            Track Order
          </Button>
        </form>

        <p className="mx-auto mt-3 max-w-xl text-center text-xs text-muted-foreground">
          Your order number is on your confirmation screen and receipt, and
          looks like <span className="font-mono">ORDER #20260922-001</span>.
        </p>
      </section>

      <section className="container pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          {!hasSearched && (
            <div
              data-ocid="track.empty_state"
              className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-card/60 px-6 py-14 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <PackageSearch className="size-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Ready when you are
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Pop in your order number above to see live progress from order
                  received all the way to ready for pickup.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-border transition-smooth hover:bg-secondary"
              >
                <Link to="/menu" data-ocid="track.browse_menu_link">
                  Browse the menu
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )}

          {hasSearched && isLoading && (
            <div
              data-ocid="track.loading_state"
              className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 shadow-subtle md:p-8"
            >
              <Skeleton className="h-7 w-48 rounded-full" />
              <div className="flex flex-col gap-5">
                {Array.from({ length: 4 }, (_, i) => `stage-${i}`).map((id) => (
                  <div key={id} className="flex items-center gap-4">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 rounded-full" />
                      <Skeleton className="h-3 w-64 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSearched && isError && (
            <div
              data-ocid="track.error_state"
              className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
            >
              <h2 className="font-display text-xl font-bold text-foreground">
                We couldn&apos;t reach the kitchen
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Something went wrong while looking up your order. Please try
                again in a moment.
              </p>
              <Button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="rounded-full bg-accent text-accent-foreground transition-smooth hover:bg-accent/90"
              >
                Try again
              </Button>
            </div>
          )}

          {notFound && (
            <div
              data-ocid="track.not_found_state"
              className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/60 px-6 py-12 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Coffee className="size-7" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">
                No order found for {submitted}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Double-check the number on your receipt — it&apos;s usually
                formatted like{" "}
                <span className="font-mono">ORDER #20260922-001</span>.
              </p>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-border transition-smooth hover:bg-secondary"
              >
                <Link to="/menu" data-ocid="track.not_found_menu_link">
                  Start a new order
                </Link>
              </Button>
            </div>
          )}

          {order && (
            <div className="flex flex-col gap-6">
              <div
                data-ocid="track.order_summary"
                className="rounded-lg border border-border bg-card p-6 shadow-subtle md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Order
                    </p>
                    <p
                      data-ocid="track.order_number"
                      className="font-mono text-2xl font-bold tracking-tight text-foreground"
                    >
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Placed {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span
                    data-ocid="track.status_badge"
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider",
                      STATUS_TONE[order.status],
                    )}
                  >
                    {humanize(order.status)}
                  </span>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {order.customer.fullName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Order Type
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {order.orderType === "dineIn"
                        ? `Dine In${order.dineIn?.tableNumber ? ` · Table ${order.dineIn.tableNumber}` : ""}`
                        : `Take Out${order.takeOut?.pickupTime ? ` · ${order.takeOut.pickupTime}` : ""}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total
                    </dt>
                    <dd className="mt-0.5 font-display text-base font-bold text-accent-foreground">
                      {formatPeso(order.total)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-subtle md:p-8">
                <h2 className="mb-6 font-display text-xl font-bold tracking-tight text-foreground">
                  Order progress
                </h2>
                <OrderStatusTimeline
                  status={order.status}
                  updatedLabel={formatDateTime(order.updatedAt)}
                />
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-subtle md:p-8">
                <div className="mb-4 flex items-center gap-2">
                  <ReceiptText
                    className="size-5 text-accent-foreground"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    Receipt
                  </h2>
                </div>
                <Receipt order={order} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
