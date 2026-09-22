import { OrderDetailDialog } from "@/components/admin/OrderDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { formatDateTime, formatPeso, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  type OrderFilter,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "@/types";
import { Eye, Receipt } from "lucide-react";
import { useState } from "react";

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: OrderStatus.orderReceived, label: "Order received" },
  { value: OrderStatus.paymentVerification, label: "Payment verification" },
  { value: OrderStatus.orderConfirmed, label: "Order confirmed" },
  { value: OrderStatus.preparing, label: "Preparing" },
  { value: OrderStatus.readyForPickup, label: "Ready for pickup" },
  { value: OrderStatus.completed, label: "Completed" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

const TYPE_FILTERS: { value: OrderType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: OrderType.dineIn, label: "Dine-in" },
  { value: OrderType.takeOut, label: "Take-out" },
];

const STATUS_TONE: Record<string, string> = {
  [OrderStatus.orderReceived]: "bg-secondary text-secondary-foreground",
  [OrderStatus.paymentVerification]: "bg-warning/20 text-warning-foreground",
  [OrderStatus.orderConfirmed]: "bg-primary/10 text-primary",
  [OrderStatus.preparing]: "bg-accent/15 text-accent",
  [OrderStatus.readyForPickup]: "bg-success/15 text-success",
  [OrderStatus.completed]: "bg-success/20 text-success",
  [OrderStatus.cancelled]: "bg-destructive/10 text-destructive",
};

function paymentLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.gcash:
      return "GCash";
    case PaymentMethod.maya:
      return "Maya";
    default:
      return "Cash";
  }
}

function FilterChip({
  active,
  label,
  ocid,
  onClick,
}: {
  active: boolean;
  label: string;
  ocid: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-secondary",
      )}
    >
      {label}
    </button>
  );
}

export function OrdersTab() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [orderType, setOrderType] = useState<OrderType | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filter: OrderFilter = {
    ...(status !== "all" ? { status } : {}),
    ...(orderType !== "all" ? { orderType } : {}),
  };

  const ordersQuery = useOrders(filter);
  const orders = ordersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border bg-card shadow-subtle">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Filter by status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((entry) => (
                <FilterChip
                  key={entry.value}
                  active={status === entry.value}
                  label={entry.label}
                  ocid={`admin.orders.status_filter.${entry.value}`}
                  onClick={() => setStatus(entry.value)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Filter by order type
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((entry) => (
                <FilterChip
                  key={entry.value}
                  active={orderType === entry.value}
                  label={entry.label}
                  ocid={`admin.orders.type_filter.${entry.value}`}
                  onClick={() => setOrderType(entry.value)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {ordersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => `orders-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-16 rounded-2xl" />
            ),
          )}
        </div>
      ) : ordersQuery.isError ? (
        <Card
          data-ocid="admin.orders.error_state"
          className="rounded-2xl border-destructive/30 bg-destructive/5"
        >
          <CardContent className="p-6 text-sm text-destructive">
            We couldn't load the order list. Refresh the page to try again.
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card
          data-ocid="admin.orders.empty_state"
          className="rounded-2xl border-dashed border-border bg-card"
        >
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Receipt className="size-5" aria-hidden="true" />
            </span>
            <p className="font-medium text-foreground">No orders match</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a different status or order type filter, or wait for new
              orders to come in.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-subtle">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow className="border-border hover:bg-secondary">
                <TableHead className="px-4">Order</TableHead>
                <TableHead className="px-4">Customer</TableHead>
                <TableHead className="px-4">Type</TableHead>
                <TableHead className="px-4">Payment</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Total</TableHead>
                <TableHead className="px-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow
                  key={order.orderNumber}
                  data-ocid={`admin.orders.row.${index + 1}`}
                  className="border-border"
                >
                  <TableCell className="px-4">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {order.orderNumber}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[12rem] truncate px-4 text-sm text-foreground">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {order.orderType === OrderType.dineIn
                      ? "Dine-in"
                      : "Take-out"}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {paymentLabel(order.paymentMethod)}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge
                      className={cn(
                        "rounded-full border-transparent text-[0.6875rem] font-semibold uppercase tracking-wider",
                        STATUS_TONE[order.status] ??
                          "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {humanize(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 text-right font-display text-base font-bold text-accent">
                    {formatPeso(order.total)}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`admin.orders.view_button.${index + 1}`}
                      onClick={() => setSelected(order.orderNumber)}
                      className="rounded-full border-border transition-smooth hover:bg-secondary"
                    >
                      <Eye className="size-4" aria-hidden="true" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <OrderDetailDialog
        orderNumber={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
