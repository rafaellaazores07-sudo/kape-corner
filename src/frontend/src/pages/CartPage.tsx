import { CartLineItem } from "@/components/cart/CartLineItem";
import { OrderSummary } from "@/components/cart/OrderSummary";
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
import { Button } from "@/components/ui/button";
import { useCartStore, useCartTotals } from "@/store/cart";
import type { CartLine } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Coffee, Trash2 } from "lucide-react";
import { useState } from "react";

export function CartPage() {
  const lines = useCartStore((state) => state.lines);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const clearCart = useCartStore((state) => state.clearCart);
  const totals = useCartTotals();

  const [pendingRemoval, setPendingRemoval] = useState<CartLine | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const isEmpty = lines.length === 0;

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-muted/50">
        <div className="container py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your Order
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Your Cart
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
            Review your drinks, adjust quantities, and head to checkout when
            you're ready.
          </p>
        </div>
      </section>

      <div className="container py-10 md:py-14">
        {isEmpty ? (
          <div
            data-ocid="cart.empty_state"
            className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-subtle"
          >
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full bg-muted text-primary"
            >
              <Coffee className="size-7" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing brewing yet. Browse the menu and add your first cup.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
            >
              <Link to="/menu" data-ocid="cart.browse_menu_button">
                Browse the menu
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                  {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}{" "}
                  in your cart
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  data-ocid="cart.clear_button"
                  onClick={() => setClearOpen(true)}
                  className="rounded-full text-sm text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Clear cart
                </Button>
              </div>

              <ul data-ocid="cart.list" className="mt-5 space-y-4">
                {lines.map((line, index) => (
                  <CartLineItem
                    key={line.lineId}
                    line={line}
                    index={index}
                    onQuantityChange={updateQuantity}
                    onRemove={setPendingRemoval}
                  />
                ))}
              </ul>

              <Button
                asChild
                variant="outline"
                className="mt-6 rounded-full border-border transition-smooth hover:bg-secondary"
              >
                <Link to="/menu" data-ocid="cart.continue_shopping_button">
                  Add more drinks
                </Link>
              </Button>
            </div>

            <OrderSummary totals={totals} className="lg:sticky lg:top-24">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
              >
                <Link to="/checkout" data-ocid="cart.checkout_button">
                  Proceed to Checkout
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You'll choose dine-in or take-out next.
              </p>
            </OrderSummary>
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
      >
        <AlertDialogContent data-ocid="cart.remove_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoval
                ? `${pendingRemoval.productName} will be removed from your cart.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="cart.remove_cancel_button"
              className="rounded-full"
            >
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="cart.remove_confirm_button"
              onClick={() => {
                if (pendingRemoval) removeLine(pendingRemoval.lineId);
                setPendingRemoval(null);
              }}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent data-ocid="cart.clear_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear your whole cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all {totals.itemCount}{" "}
              {totals.itemCount === 1 ? "item" : "items"} from your cart. This
              can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="cart.clear_cancel_button"
              className="rounded-full"
            >
              Keep my cart
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="cart.clear_confirm_button"
              onClick={() => {
                clearCart();
                setClearOpen(false);
              }}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
