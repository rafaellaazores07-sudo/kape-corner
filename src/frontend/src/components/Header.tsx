import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartItemCount } from "@/store/cart";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Coffee, LogOut, Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartItemCount();
  const { clear, isAuthenticated } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const handleSignOut = () => {
    clear();
    queryClient.clear();
    setMobileOpen(false);
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <header
      data-ocid="header"
      className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          to="/"
          data-ocid="header.brand_link"
          className="flex min-w-0 items-center gap-2.5 transition-smooth hover:opacity-90"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-subtle">
            <Coffee className="size-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
              Kape Corner
            </span>
            <span className="hidden text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Brewed in the Philippines
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={`header.nav.${link.label.toLowerCase().replace(/\s+/g, "_")}`}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-smooth",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            data-ocid="header.cart_link"
            aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className="relative flex size-11 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span
                data-ocid="header.cart_count"
                className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.6875rem] font-bold leading-5 text-accent-foreground"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <Button
            asChild
            className="hidden rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated sm:inline-flex"
          >
            <Link to="/menu" data-ocid="header.order_now_button">
              Order Now
            </Link>
          </Button>

          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              data-ocid="header.login_link"
              onClick={handleSignOut}
              className="hidden rounded-full border-border transition-smooth hover:bg-secondary lg:inline-flex"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="hidden rounded-full border-border transition-smooth hover:bg-secondary lg:inline-flex"
            >
              <Link to="/auth" data-ocid="header.login_link">
                Customer sign in
              </Link>
            </Button>
          )}

          <button
            type="button"
            data-ocid="header.mobile_menu_button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex size-11 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary lg:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <MenuIcon className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile"
          data-ocid="header.mobile_menu"
          className="border-t border-border bg-card lg:hidden"
        >
          <div className="container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={`header.mobile_nav.${link.label.toLowerCase().replace(/\s+/g, "_")}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-base font-medium transition-smooth",
                  pathname === link.to
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground hover:bg-secondary/60",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/menu"
              data-ocid="header.mobile_order_now_button"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-accent px-4 py-3 text-center text-base font-semibold text-accent-foreground transition-smooth hover:bg-accent/90"
            >
              Order Now
            </Link>
            {isAuthenticated ? (
              <button
                type="button"
                data-ocid="header.mobile_login_link"
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-center text-base font-medium text-foreground transition-smooth hover:bg-secondary"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                data-ocid="header.mobile_login_link"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-border px-4 py-3 text-center text-base font-medium text-foreground transition-smooth hover:bg-secondary"
              >
                Customer sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
