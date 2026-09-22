import { OrderSummary } from "@/components/cart/OrderSummary";
import { CustomerForm } from "@/components/checkout/CustomerForm";
import { OrderTypeSelector } from "@/components/checkout/OrderTypeSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore, useCartTotals } from "@/store/cart";
import { useCheckoutStore } from "@/store/checkout";
import { OrderType } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Coffee, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

export function CheckoutPage() {
  const navigate = useNavigate();
  const lines = useCartStore((state) => state.lines);
  const totals = useCartTotals();

  const orderType = useCheckoutStore((state) => state.orderType);
  const customer = useCheckoutStore((state) => state.customer);
  const dineIn = useCheckoutStore((state) => state.dineIn);
  const takeOut = useCheckoutStore((state) => state.takeOut);
  const specialInstructions = useCheckoutStore(
    (state) => state.specialInstructions,
  );
  const setOrderType = useCheckoutStore((state) => state.setOrderType);
  const setCustomer = useCheckoutStore((state) => state.setCustomer);
  const setDineIn = useCheckoutStore((state) => state.setDineIn);
  const setTakeOut = useCheckoutStore((state) => state.setTakeOut);
  const setSpecialInstructions = useCheckoutStore(
    (state) => state.setSpecialInstructions,
  );

  const [orderTypeError, setOrderTypeError] = useState<string | undefined>();
  const [detailsError, setDetailsError] = useState<string | undefined>();

  if (lines.length === 0) {
    return (
      <div className="bg-background">
        <div className="container py-16 md:py-24">
          <div
            data-ocid="checkout.empty_state"
            className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-subtle"
          >
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full bg-muted text-primary"
            >
              <Coffee className="size-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Nothing to check out yet
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Add a drink to your cart before checking out.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
            >
              <Link to="/menu" data-ocid="checkout.browse_menu_button">
                Browse the menu
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleProceed = () => {
    let valid = true;

    if (!orderType) {
      setOrderTypeError("Please choose dine-in or take-out to continue.");
      valid = false;
    } else {
      setOrderTypeError(undefined);
    }

    if (orderType === OrderType.dineIn) {
      if (!dineIn.tableNumber.trim() || dineIn.numberOfCustomers < 1) {
        setDetailsError(
          "Please enter your table number and how many customers are dining.",
        );
        valid = false;
      } else {
        setDetailsError(undefined);
      }
    } else if (orderType === OrderType.takeOut) {
      if (
        !takeOut.customerName.trim() ||
        !takeOut.contactNumber.trim() ||
        !takeOut.pickupTime.trim()
      ) {
        setDetailsError(
          "Please complete the take-out name, contact number, and pickup time.",
        );
        valid = false;
      } else {
        setDetailsError(undefined);
      }
    }

    if (!valid) return;

    const form = document.getElementById(
      "checkout-customer-form",
    ) as HTMLFormElement | null;
    form?.requestSubmit();
  };

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-muted/50">
        <div className="container py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Almost There
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Checkout
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
            Tell us how you'd like your order and where we can reach you.
          </p>
        </div>
      </section>

      <div className="container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-8">
            <section
              data-ocid="checkout.order_type_section"
              className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6"
            >
              <OrderTypeSelector
                value={orderType}
                onChange={(value) => {
                  setOrderType(value);
                  setOrderTypeError(undefined);
                  setDetailsError(undefined);
                }}
                error={orderTypeError}
              />
            </section>

            {orderType === OrderType.dineIn && (
              <section
                data-ocid="checkout.dine_in_section"
                className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"
                  >
                    <UtensilsCrossed className="size-4" />
                  </span>
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    Dine-In Details
                  </h2>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="table-number">Table number</Label>
                    <Input
                      id="table-number"
                      data-ocid="checkout.table_number_input"
                      value={dineIn.tableNumber}
                      onChange={(event) =>
                        setDineIn({
                          ...dineIn,
                          tableNumber: event.target.value,
                        })
                      }
                      placeholder="e.g. 12"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="number-of-customers">
                      Number of customers
                    </Label>
                    <Input
                      id="number-of-customers"
                      data-ocid="checkout.number_of_customers_input"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={30}
                      value={dineIn.numberOfCustomers}
                      onChange={(event) =>
                        setDineIn({
                          ...dineIn,
                          numberOfCustomers: Math.max(
                            1,
                            Number(event.target.value) || 1,
                          ),
                        })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </section>
            )}

            {orderType === OrderType.takeOut && (
              <section
                data-ocid="checkout.take_out_section"
                className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"
                  >
                    <ShoppingBag className="size-4" />
                  </span>
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    Take-Out Details
                  </h2>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="pickup-name">Name for pickup</Label>
                    <Input
                      id="pickup-name"
                      data-ocid="checkout.pickup_name_input"
                      value={takeOut.customerName}
                      onChange={(event) =>
                        setTakeOut({
                          ...takeOut,
                          customerName: event.target.value,
                        })
                      }
                      placeholder="Name we'll call out"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pickup-contact">Contact number</Label>
                    <Input
                      id="pickup-contact"
                      data-ocid="checkout.pickup_contact_input"
                      type="tel"
                      inputMode="tel"
                      value={takeOut.contactNumber}
                      onChange={(event) =>
                        setTakeOut({
                          ...takeOut,
                          contactNumber: event.target.value,
                        })
                      }
                      placeholder="0917 123 4567"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="pickup-time">Pickup time</Label>
                    <Input
                      id="pickup-time"
                      data-ocid="checkout.pickup_time_input"
                      type="time"
                      value={takeOut.pickupTime}
                      onChange={(event) =>
                        setTakeOut({
                          ...takeOut,
                          pickupTime: event.target.value,
                        })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </section>
            )}

            <section
              data-ocid="checkout.customer_section"
              className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6"
            >
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                Your Details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use these to confirm your order.
              </p>
              <div className="mt-5">
                <CustomerForm
                  defaultValues={customer}
                  onValidChange={setCustomer}
                  onSubmit={(values) => {
                    setCustomer(values);
                    void navigate({ to: "/payment" });
                  }}
                />
              </div>
            </section>

            <section
              data-ocid="checkout.instructions_section"
              className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6"
            >
              <Label htmlFor="special-instructions">Special instructions</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional — allergies, less ice, or anything else we should know.
              </p>
              <Textarea
                id="special-instructions"
                data-ocid="checkout.special_instructions_input"
                rows={3}
                value={specialInstructions}
                onChange={(event) => setSpecialInstructions(event.target.value)}
                placeholder="Less ice, extra shot, allergies…"
                className="mt-3 rounded-xl"
              />
            </section>
          </div>

          <OrderSummary totals={totals} className="lg:sticky lg:top-24">
            {detailsError && (
              <p
                data-ocid="checkout.details_error"
                role="alert"
                className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {detailsError}
              </p>
            )}
            <Button
              type="button"
              size="lg"
              data-ocid="checkout.proceed_button"
              onClick={handleProceed}
              className="w-full rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
            >
              Continue to Payment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              asChild
              variant="ghost"
              className="mt-2 w-full rounded-full text-muted-foreground transition-smooth hover:bg-secondary"
            >
              <Link to="/cart" data-ocid="checkout.back_to_cart_button">
                Back to cart
              </Link>
            </Button>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
