import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCancelOrder,
  useOrder,
  useUpdateOrderStatus,
  useVerifyPayment,
} from "@/hooks/use-orders";
import { storedFileBlob } from "@/lib/backend";
import { formatDateTime, formatPeso, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  type Order,
  OrderStatus,
  type OrderStatus as OrderStatusType,
  OrderType,
  PaymentMethod,
} from "@/types";
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  Printer,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

interface OrderDetailDialogProps {
  orderNumber: string | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_FLOW: OrderStatusType[] = [
  OrderStatus.orderReceived,
  OrderStatus.paymentVerification,
  OrderStatus.orderConfirmed,
  OrderStatus.preparing,
  OrderStatus.readyForPickup,
  OrderStatus.completed,
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
      return "Cash on pickup";
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function ReceiptBody({ order }: { order: Order }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-lg font-bold text-foreground">
            {order.orderNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge
          className={cn(
            "rounded-full border-transparent text-[0.6875rem] font-semibold uppercase tracking-wider",
            STATUS_TONE[order.status] ??
              "bg-secondary text-secondary-foreground",
          )}
        >
          {humanize(order.status)}
        </Badge>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Customer
          </p>
          <p className="text-sm font-medium text-foreground">
            {order.customer.fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.customer.mobileNumber}
          </p>
          <p className="break-all text-sm text-muted-foreground">
            {order.customer.email}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Order type
          </p>
          <p className="text-sm font-medium text-foreground">
            {order.orderType === OrderType.dineIn ? "Dine-in" : "Take-out"}
          </p>
          {order.dineIn && (
            <p className="text-sm text-muted-foreground">
              Table {order.dineIn.tableNumber} ·{" "}
              {String(order.dineIn.numberOfCustomers)} guests
            </p>
          )}
          {order.takeOut && (
            <p className="text-sm text-muted-foreground">
              Pickup: {order.takeOut.pickupTime}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Items
        </p>
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li
              key={`${item.productId}-${index}`}
              className="flex items-start justify-between gap-4 rounded-xl bg-secondary/50 px-4 py-3"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {String(item.quantity)}× {item.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[
                    item.customization.sizeId !== undefined
                      ? `Size #${String(item.customization.sizeId)}`
                      : null,
                    item.customization.sugarLevel
                      ? `Sugar: ${item.customization.sugarLevel}`
                      : null,
                    item.customization.iceLevel
                      ? `Ice: ${item.customization.iceLevel}`
                      : null,
                    item.customization.milkOption
                      ? `Milk: ${item.customization.milkOption}`
                      : null,
                    item.customization.addOnIds.length > 0
                      ? `${item.customization.addOnIds.length} add-on(s)`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No customization"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-foreground">
                {formatPeso(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {order.specialInstructions && (
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Special instructions
          </p>
          <p className="mt-1 text-sm text-foreground">
            {order.specialInstructions}
          </p>
        </div>
      )}

      <Separator />

      <div className="space-y-1">
        <DetailRow label="Subtotal" value={formatPeso(order.subtotal)} />
        <DetailRow label="Service fee" value={formatPeso(order.serviceFee)} />
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="font-display text-base font-bold text-foreground">
            Total
          </span>
          <span className="font-display text-xl font-bold text-accent">
            {formatPeso(order.total)}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Payment
        </p>
        <DetailRow label="Method" value={paymentLabel(order.payment.method)} />
        <DetailRow
          label="Reference number"
          value={order.payment.referenceNumber || "—"}
        />
        {order.payment.proof && (
          <div className="space-y-2 pt-1">
            <p className="text-sm text-muted-foreground">Payment proof</p>
            <a
              href={storedFileBlob(order.payment.proof).getDirectURL()}
              target="_blank"
              rel="noreferrer"
              data-ocid="admin.order.proof_link"
              className="block w-fit overflow-hidden rounded-xl border border-border transition-smooth hover:opacity-90"
            >
              <img
                src={storedFileBlob(order.payment.proof).getDirectURL()}
                alt={`Payment proof for ${order.orderNumber}`}
                className="max-h-56 w-auto object-contain"
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderDetailDialog({
  orderNumber,
  onOpenChange,
}: OrderDetailDialogProps) {
  const orderQuery = useOrder(orderNumber ?? undefined);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();
  const verifyPayment = useVerifyPayment();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const order = orderQuery.data ?? null;
  const isOpen = orderNumber !== null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          data-ocid="admin.order.dialog"
          className="max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
              <Receipt className="size-5 text-accent" aria-hidden="true" />
              Order details
            </DialogTitle>
            <DialogDescription>
              Review the full order, verify payment, and move it through the
              kitchen.
            </DialogDescription>
          </DialogHeader>

          {orderQuery.isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 6 }, (_, i) => `order-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-10 rounded-xl" />
                ),
              )}
            </div>
          ) : !order ? (
            <p
              data-ocid="admin.order.error_state"
              className="py-6 text-sm text-destructive"
            >
              We couldn't load this order. It may have been removed.
            </p>
          ) : (
            <div className="space-y-6 py-2">
              <ReceiptBody order={order} />

              <div className="space-y-3 rounded-2xl border border-border bg-secondary/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Update status
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((status) => {
                    const active = order.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        data-ocid={`admin.order.status_button.${status}`}
                        aria-pressed={active}
                        disabled={active || updateStatus.isPending}
                        onClick={() =>
                          updateStatus.mutate({
                            orderNumber: order.orderNumber,
                            status,
                          })
                        }
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth disabled:cursor-not-allowed",
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-secondary disabled:opacity-60",
                        )}
                      >
                        {humanize(status)}
                      </button>
                    );
                  })}
                </div>
                {updateStatus.isError && (
                  <p className="text-sm text-destructive">
                    That status change isn't allowed from the current state.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {order.payment.method !== PaymentMethod.cash && (
                  <Button
                    type="button"
                    data-ocid="admin.order.verify_payment_button"
                    disabled={verifyPayment.isPending}
                    onClick={() => verifyPayment.mutate(order.orderNumber)}
                    className="rounded-full bg-success text-success-foreground transition-smooth hover:bg-success/90"
                  >
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Verify {paymentLabel(order.payment.method)} payment
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="admin.order.print_button"
                  onClick={handlePrint}
                  className="rounded-full border-border transition-smooth hover:bg-secondary"
                >
                  <Printer className="size-4" aria-hidden="true" />
                  Print receipt
                </Button>
                {order.status !== OrderStatus.cancelled &&
                  order.status !== OrderStatus.completed && (
                    <Button
                      type="button"
                      variant="outline"
                      data-ocid="admin.order.cancel_button"
                      onClick={() => setConfirmCancel(true)}
                      className="rounded-full border-border text-destructive transition-smooth hover:bg-destructive/10"
                    >
                      <Ban className="size-4" aria-hidden="true" />
                      Cancel order
                    </Button>
                  )}
              </div>

              {verifyPayment.isSuccess && (
                <p
                  data-ocid="admin.order.success_state"
                  className="flex items-center gap-2 text-sm text-success"
                >
                  <BadgeCheck className="size-4" aria-hidden="true" />
                  Payment verified.
                </p>
              )}
              {verifyPayment.isError && (
                <p className="text-sm text-destructive">
                  We couldn't verify this payment. Try again.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent
          data-ocid="admin.order.cancel_dialog"
          className="rounded-2xl border-border bg-card"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-bold tracking-tight">
              Cancel this order?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {order
                ? `Order ${order.orderNumber} for ${order.customer.fullName} will be marked as cancelled. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.order.cancel_keep_button"
              className="rounded-full border-border"
            >
              Keep order
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.order.cancel_confirm_button"
              onClick={() => {
                if (order) cancelOrder.mutate(order.orderNumber);
                setConfirmCancel(false);
              }}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
