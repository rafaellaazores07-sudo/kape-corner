import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { ProofUpload } from "@/components/payment/ProofUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentSettings } from "@/hooks/use-menu";
import { usePlaceOrder } from "@/hooks/use-orders";
import { describeOrderError, storedFileBlob } from "@/lib/backend";
import { formatPeso } from "@/lib/format";
import { toCentavos, useCartStore, useCartTotals } from "@/store/cart";
import { useCheckoutStore } from "@/store/checkout";
import type { OrderItem, PaymentInfo, PlaceOrderInput } from "@/types";
import { OrderType, PaymentMethod } from "@/types";
import type { ExternalBlob } from "@caffeineai/object-storage";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Coffee,
  Info,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

const PAYMENT_STEPS: Record<"gcash" | "maya", string[]> = {
  gcash: [
    "Open your GCash app and tap Send Money.",
    "Enter the shop's GCash number shown above.",
    "Enter the exact total amount for your order.",
    "Screenshot the confirmation and note the reference number.",
    "Paste the reference number below and attach your receipt.",
  ],
  maya: [
    "Open your Maya app and tap Send Money.",
    "Enter the shop's Maya number shown above.",
    "Enter the exact total amount for your order.",
    "Screenshot the confirmation and note the reference number.",
    "Paste the reference number below and attach your receipt.",
  ],
};

export function PaymentPage() {
  const navigate = useNavigate();
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clearCart);
  const totals = useCartTotals();
  const checkout = useCheckoutStore();
  const settings = usePaymentSettings();
  const placeOrder = usePlaceOrder();

  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.gcash);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofBlob, setProofBlob] = useState<ExternalBlob | null>(null);
  const [proofFilename, setProofFilename] = useState<string | null>(null);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const needsReference =
    method === PaymentMethod.gcash || method === PaymentMethod.maya;
  const shopNumber =
    method === PaymentMethod.gcash
      ? settings.data?.gcashNumber
      : method === PaymentMethod.maya
        ? settings.data?.mayaNumber
        : undefined;
  const shopQr =
    method === PaymentMethod.gcash
      ? settings.data?.gcashQr
      : method === PaymentMethod.maya
        ? settings.data?.mayaQr
        : undefined;

  const handleSubmit = () => {
    setSubmitError(null);

    if (lines.length === 0) {
      setSubmitError("Your cart is empty. Add a drink before paying.");
      return;
    }

    if (!checkout.orderType) {
      void navigate({ to: "/checkout" });
      return;
    }

    const trimmedReference = referenceNumber.trim();
    if (needsReference && trimmedReference.length < 4) {
      setReferenceError(
        "Enter the reference number from your GCash or Maya receipt (at least 4 characters).",
      );
      return;
    }
    setReferenceError(null);

    const orderType = checkout.orderType;
    const items: OrderItem[] = lines.map((line) => {
      const unitPrice = toCentavos(line.unitPrice);
      return {
        productId: line.productId,
        productName: line.productName,
        quantity: BigInt(line.quantity),
        unitPrice,
        lineTotal: unitPrice * BigInt(line.quantity),
        customization: {
          sizeId: line.sizeId,
          sugarLevel: line.sugarLevel,
          iceLevel: line.iceLevel,
          milkOption: line.milkOption,
          addOnIds: line.addOnIds.map((id) => toCentavos(id)),
        },
      };
    });

    const payment: PaymentInfo = {
      method,
      referenceNumber: needsReference ? trimmedReference : undefined,
      proof:
        proofBlob && proofFilename
          ? {
              // Generated bindings type StoredFile.blob as FileRef, but the
              // runtime actor converts it to an ExternalBlob (see backend.ts).
              blob: proofBlob as unknown as PaymentInfo["proof"] extends
                | { blob: infer B }
                | undefined
                ? B
                : never,
              mimeType: "image/*",
              filename: proofFilename,
            }
          : undefined,
    };

    const input: PlaceOrderInput = {
      customer: {
        fullName: checkout.customer.fullName.trim(),
        mobileNumber: checkout.customer.mobileNumber.trim(),
        email: checkout.customer.email.trim(),
      },
      orderType,
      takeOut:
        orderType === OrderType.takeOut
          ? { pickupTime: checkout.takeOut.pickupTime.trim() }
          : undefined,
      dineIn:
        orderType === OrderType.dineIn
          ? {
              numberOfCustomers: BigInt(checkout.dineIn.numberOfCustomers),
              tableNumber: checkout.dineIn.tableNumber.trim(),
            }
          : undefined,
      specialInstructions: checkout.specialInstructions.trim(),
      items,
      payment,
    };

    placeOrder.mutate(input, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          clearCart();
          checkout.reset();
          void navigate({
            to: "/confirmation",
            search: { order: result.ok },
          });
        } else {
          setSubmitError(describeOrderError(result.err));
        }
      },
      onError: () => {
        setSubmitError(
          "We couldn't reach the shop just now. Please try again in a moment.",
        );
      },
    });
  };

  if (lines.length === 0) {
    return (
      <section
        data-ocid="payment.page"
        className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Coffee className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Nothing to pay for yet
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Your cart is empty. Pick a drink from the menu and we'll bring you
          right back here.
        </p>
        <Button
          asChild
          className="rounded-full bg-accent font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
        >
          <Link to="/menu" data-ocid="payment.empty_state.browse_button">
            Browse the menu
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section data-ocid="payment.page" className="bg-background py-10 md:py-14">
      <div className="container flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Link
            to="/checkout"
            data-ocid="payment.back_link"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to checkout
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Step 2 of 3
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Pay for your order
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Send your payment, then confirm it here. We'll verify your reference
            number before your drinks go on the bar.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="flex flex-col gap-6">
            <PaymentMethodSelector value={method} onChange={setMethod} />

            {needsReference && (
              <div
                data-ocid="payment.instructions.panel"
                className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Send your{" "}
                    {method === PaymentMethod.gcash ? "GCash" : "Maya"} payment
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Follow these steps, then enter your reference number below.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-40 items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary/50">
                      {settings.isLoading ? (
                        <Skeleton className="size-full rounded-none" />
                      ) : shopQr ? (
                        <img
                          src={storedFileBlob(shopQr).getDirectURL()}
                          alt={`${method === PaymentMethod.gcash ? "GCash" : "Maya"} payment QR code for Kape Corner`}
                          className="size-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 px-4 text-center">
                          <QrCode
                            className="size-8 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="text-xs text-muted-foreground">
                            QR code not set up yet
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Scan to pay
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {method === PaymentMethod.gcash
                          ? "GCash number"
                          : "Maya number"}
                      </span>
                      {settings.isLoading ? (
                        <Skeleton className="h-6 w-40" />
                      ) : (
                        <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                          {shopNumber || "Not configured yet"}
                        </span>
                      )}
                    </div>

                    <ol className="flex flex-col gap-2.5">
                      {PAYMENT_STEPS[
                        method === PaymentMethod.gcash ? "gcash" : "maya"
                      ].map((step, index) => (
                        <li
                          key={step}
                          className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent-foreground">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-5">
                  <Label htmlFor="payment-reference">
                    Payment reference number
                  </Label>
                  <Input
                    id="payment-reference"
                    data-ocid="payment.reference_input"
                    value={referenceNumber}
                    onChange={(event) => {
                      setReferenceNumber(event.target.value);
                      if (referenceError) setReferenceError(null);
                    }}
                    placeholder="e.g. 0123456789012"
                    autoComplete="off"
                    aria-invalid={referenceError ? true : undefined}
                    aria-describedby={
                      referenceError ? "payment-reference-error" : undefined
                    }
                    className="h-11 rounded-xl border-input bg-background font-mono"
                  />
                  {referenceError && (
                    <p
                      id="payment-reference-error"
                      role="alert"
                      data-ocid="payment.reference.error_state"
                      className="text-xs font-medium text-destructive"
                    >
                      {referenceError}
                    </p>
                  )}
                </div>

                <ProofUpload
                  onChange={setProofBlob}
                  onFilenameChange={setProofFilename}
                />
              </div>
            )}

            {method === PaymentMethod.cash && (
              <div
                data-ocid="payment.cash.panel"
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-lg font-bold tracking-tight">
                    Pay in cash at the counter
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    No reference number needed. Please prepare the exact amount
                    when you pick up your order — our barista will confirm your
                    order number.
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside
            data-ocid="payment.summary.panel"
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6 lg:sticky lg:top-24"
          >
            <h2 className="font-display text-lg font-bold tracking-tight">
              Order summary
            </h2>

            <ul className="flex flex-col gap-3">
              {lines.map((line) => (
                <li
                  key={line.lineId}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-foreground">
                      {line.quantity}× {line.productName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {[
                        line.sizeName,
                        line.sugarLevel,
                        line.iceLevel,
                        line.milkOption,
                        ...line.addOnNames,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Standard"}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-foreground">
                    {formatPeso(
                      toCentavos(line.unitPrice) * BigInt(line.quantity),
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPeso(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Service fee</dt>
                <dd className="tabular-nums">
                  {formatPeso(totals.serviceFee)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="font-display text-base font-bold">Total</dt>
                <dd className="font-display text-xl font-bold text-primary tabular-nums">
                  {formatPeso(totals.total)}
                </dd>
              </div>
            </dl>

            <div className="flex items-start gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>
                GCash and Maya payments are verified by our staff before your
                order is prepared.
              </span>
            </div>

            {submitError && (
              <p
                role="alert"
                data-ocid="payment.error_state"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs font-medium text-destructive"
              >
                {submitError}
              </p>
            )}

            <Button
              type="button"
              data-ocid="payment.submit_button"
              onClick={handleSubmit}
              disabled={placeOrder.isPending}
              className="h-12 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Placing your order…
                </>
              ) : (
                <>
                  <Lock className="mr-2 size-4" aria-hidden="true" />
                  Place order · {formatPeso(totals.total)}
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By placing this order you agree to pay the total shown above.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
