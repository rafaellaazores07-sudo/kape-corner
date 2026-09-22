import { Button } from "@/components/ui/button";
import { useCallerRole, useRegisterCustomer } from "@/lib/backend";
import { CallerRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Coffee,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";

function shortenPrincipal(principal: string): string {
  if (principal.length <= 18) return principal;
  return `${principal.slice(0, 9)}…${principal.slice(-6)}`;
}

export function AuthPage() {
  const {
    login,
    clear,
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
  } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const roleQuery = useCallerRole(isAuthenticated);
  const registerCustomer = useRegisterCustomer();

  const principal = identity?.getPrincipal().toString() ?? null;
  const isAdmin = roleQuery.data === CallerRole.admin;

  // Register the signed-in caller as a customer account. `registerCustomer()`
  // is idempotent and always assigns the non-admin `user` role, so a customer
  // signing in here can never claim the shop's first-admin slot.
  const { mutate: register } = registerCustomer;
  useEffect(() => {
    if (isAuthenticated && roleQuery.data === CallerRole.anonymous) {
      register();
    }
  }, [isAuthenticated, roleQuery.data, register]);

  // An admin who lands on the customer page belongs in the admin area.
  useEffect(() => {
    if (isAdmin) {
      void navigate({ to: "/admin", replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSignIn = () => {
    login();
  };

  const handleSignOut = () => {
    clear();
    queryClient.clear();
  };

  return (
    <section data-ocid="auth.page" className="bg-gradient-warm py-14 md:py-20">
      <div className="container flex justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-7 shadow-subtle sm:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-subtle">
              <Coffee className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Customer
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {isAuthenticated ? "You're signed in" : "Customer sign in"}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {isAuthenticated
                  ? "Your Internet Identity is connected to this device. You can sign out at any time."
                  : "Sign in or register to order coffee, save your details, and track your orders. No password to remember."}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div
              data-ocid="auth.signed_in_panel"
              className="mt-8 flex flex-col gap-6"
            >
              <div className="rounded-2xl border border-border bg-secondary/50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2
                    className="size-4 text-success"
                    aria-hidden="true"
                  />
                  {roleQuery.data === CallerRole.anonymous
                    ? "Setting up your customer account…"
                    : "Signed in as a customer"}
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your principal
                </p>
                <p
                  data-ocid="auth.principal"
                  title={principal ?? undefined}
                  className="mt-1 break-all font-mono text-sm text-foreground"
                >
                  {principal ? shortenPrincipal(principal) : "—"}
                </p>
              </div>

              <Button
                type="button"
                data-ocid="auth.signout_button"
                onClick={handleSignOut}
                variant="outline"
                className="w-full rounded-full border-border transition-smooth hover:bg-secondary"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-6">
              <Button
                type="button"
                data-ocid="auth.signin_button"
                onClick={handleSignIn}
                disabled={isInitializing || isLoggingIn}
                className="w-full rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
              >
                <UserRound className="size-4" aria-hidden="true" />
                {isInitializing
                  ? "Preparing sign-in…"
                  : isLoggingIn
                    ? "Signing in…"
                    : "Sign in with Internet Identity"}
              </Button>

              <div className="rounded-2xl border border-border bg-secondary/50 p-5 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  New here? You're registered automatically
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Internet Identity creates your customer account the first time
                  you sign in — there's no separate registration form to fill
                  out. Just tap the button above and follow the prompts. Your
                  account is registered as a customer, never as staff.
                </p>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            Kape Corner staff can manage the shop from the{" "}
            <Link
              to="/admin/login"
              data-ocid="auth.admin_link"
              className="font-medium text-primary underline-offset-4 transition-smooth hover:underline"
            >
              staff portal
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
