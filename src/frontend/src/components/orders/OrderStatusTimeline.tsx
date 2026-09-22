import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { Check, X } from "lucide-react";

/** The happy-path progression of an order, in order. */
const STAGES: { status: OrderStatus; label: string; hint: string }[] = [
  {
    status: OrderStatus.orderReceived,
    label: "Order Received",
    hint: "We have your order and it is queued up.",
  },
  {
    status: OrderStatus.paymentVerification,
    label: "Payment Verification",
    hint: "We are checking your payment reference.",
  },
  {
    status: OrderStatus.orderConfirmed,
    label: "Order Confirmed",
    hint: "Payment cleared — your order is locked in.",
  },
  {
    status: OrderStatus.preparing,
    label: "Preparing",
    hint: "Our barista is brewing your order now.",
  },
  {
    status: OrderStatus.readyForPickup,
    label: "Ready for Pickup",
    hint: "Your order is waiting at the counter.",
  },
  {
    status: OrderStatus.completed,
    label: "Completed",
    hint: "Enjoy your coffee. Salamat!",
  },
];

interface OrderStatusTimelineProps {
  status: OrderStatus;
  /** Optional timestamp for the current stage, rendered as a caption. */
  updatedLabel?: string;
}

export function OrderStatusTimeline({
  status,
  updatedLabel,
}: OrderStatusTimelineProps) {
  const cancelled = status === OrderStatus.cancelled;
  const currentIndex = STAGES.findIndex((stage) => stage.status === status);
  const activeIndex = cancelled ? -1 : currentIndex;

  return (
    <div data-ocid="track.timeline" className="w-full">
      {cancelled && (
        <div
          data-ocid="track.cancelled_state"
          className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <X className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-foreground">
              This order was cancelled
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              If this looks wrong, message us on the Contact page and we will
              sort it out.
            </p>
          </div>
        </div>
      )}

      <ol className="relative flex flex-col gap-0">
        {STAGES.map((stage, index) => {
          const isComplete = !cancelled && index < activeIndex;
          const isCurrent = !cancelled && index === activeIndex;
          const isUpcoming = cancelled || index > activeIndex;
          const isLast = index === STAGES.length - 1;

          return (
            <li
              key={stage.status}
              data-ocid={`track.stage.${index + 1}`}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[0.9375rem] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full",
                    isComplete ? "bg-accent" : "bg-border",
                  )}
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-smooth",
                  isComplete &&
                    "border-accent bg-accent text-accent-foreground",
                  isCurrent &&
                    "border-accent bg-accent text-accent-foreground shadow-elevated",
                  isUpcoming && "border-border bg-card text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <span>{index + 1}</span>
                )}
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-ping rounded-full bg-accent/40"
                  />
                )}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p
                    className={cn(
                      "font-display text-base font-semibold",
                      isUpcoming ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <span
                      data-ocid={`track.stage.${index + 1}.current_badge`}
                      className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-accent-foreground"
                    >
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stage.hint}
                </p>
                {isCurrent && updatedLabel && (
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Updated {updatedLabel}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
