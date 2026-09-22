import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallerRole, useInitializeAccessControl } from "@/lib/backend";
import { CallerRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Coffee,
  Lock,
  ShieldAlert,
  Store,
  UserRound,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

function GuardShell({ children }: { children: ReactNode }) {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-subtle">
        {children}
      </div>
    </div>
  );
}

function AdminLoading() {
  return (
    <GuardShell>
      <div
        data-ocid="admin.guard.loading_state"
        className="flex flex-col items-center gap-5"
      >
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-4 w-56 rounded-full" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>
    </GuardShell>
  );
}

/**
 * Staff sign-in surface at `/admin/login`.
 *
 * Visually distinct from the customer `/auth` page: a dark roasted-coffee
 * panel, an explicit "Staff / Admin" label, and no customer registration
 * option. An already-signed-in admin is redirected straight to `/admin`.
 */
export function StaffLoginPage() {
  const { login, isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const roleQuery = useCallerRole(isAuthenticated);
  const initializeAccessControl = useInitializeAccessControl();
  const navigate = useNavigate();

  const isAdmin = roleQuery.data === CallerRole.admin;

  // The staff portal is the only surface that bootstraps staff access: the
  // first signed-in caller becomes the shop admin, later callers are assigned
  // the non-admin `user` role. `registerCustomer()` always assigns `user`, so
  // it can never claim the admin slot.
  const { mutate: bootstrapAccess } = initializeAccessControl;
  useEffect(() => {
    if (isAuthenticated && roleQuery.data === CallerRole.anonymous) {
      bootstrapAccess();
    }
  }, [isAuthenticated, roleQuery.data, bootstrapAccess]);

  useEffect(() => {
    if (isAdmin) {
      void navigate({ to: "/admin", replace: true });
    }
  }, [isAdmin, navigate]);

  if (
    isInitializing ||
    (isAuthenticated &&
      (roleQuery.isLoading || initializeAccessControl.isPending))
  ) {
    return <AdminLoading />;
  }

  if (isAdmin) {
    return <AdminLoading />;
  }

  return (
    <section
      data-ocid="admin.login.page"
      className="bg-gradient-primary py-14 text-primary-foreground md:py-20"
    >
      <div className="container flex justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-7 shadow-elevated backdrop-blur sm:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-subtle">
              <Lock className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Staff / Admin
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
                Staff sign-in
              </h1>
              <p className="text-sm leading-relaxed text-primary-foreground/80 md:text-base">
                This portal is for Kape Corner staff only. Sign in to manage the
                menu, orders, and payments. Customers should use the storefront
                sign-in instead.
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div
              data-ocid="admin.login.denied_state"
              className="mt-8 flex flex-col items-center gap-5 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/20 text-destructive-foreground">
                <ShieldAlert className="size-6" aria-hidden="true" />
              </span>
              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold tracking-tight">
                  This account isn't a staff account
                </h2>
                <p className="text-sm leading-relaxed text-primary-foreground/80">
                  You're signed in, but this account doesn't have administrator
                  access. Ask the shop owner to grant you access, or continue to
                  the storefront.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground transition-smooth hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/" data-ocid="admin.login.storefront_link">
                  <Store className="size-4" aria-hidden="true" />
                  Go to storefront
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-6">
              <Button
                type="button"
                data-ocid="admin.login.signin_button"
                onClick={() => login()}
                disabled={isInitializing || isLoggingIn}
                className="w-full rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
              >
                <UserRound className="size-4" aria-hidden="true" />
                {isInitializing
                  ? "Preparing sign-in…"
                  : isLoggingIn
                    ? "Signing in…"
                    : "Sign in as staff"}
              </Button>

              <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Coffee className="size-4 text-accent" aria-hidden="true" />
                  Staff accounts only
                </div>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
                  There's no staff self-registration. The shop owner grants
                  administrator access to staff accounts.
                </p>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-relaxed text-primary-foreground/70">
            Looking to order coffee?{" "}
            <Link
              to="/auth"
              data-ocid="admin.login.customer_link"
              className="font-medium text-accent underline-offset-4 transition-smooth hover:underline"
            >
              Go to customer sign-in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Gates the admin area behind Internet Identity plus the backend admin role.
 * The first authenticated user to sign in becomes admin automatically.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { login, clear, isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const queryClient = useQueryClient();

  const roleQuery = useCallerRole(isAuthenticated);

  if (isInitializing || (isAuthenticated && roleQuery.isLoading)) {
    return <AdminLoading />;
  }

  if (!isAuthenticated) {
    return (
      <GuardShell>
        <div
          data-ocid="admin.guard.login_panel"
          className="flex flex-col items-center gap-5"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-subtle">
            <Lock className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Staff / Admin
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Admin sign-in
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This area is for Kape Corner staff. Sign in with Internet Identity
              to manage the menu, orders, and payments.
            </p>
          </div>
          <Button
            type="button"
            data-ocid="admin.guard.login_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
          >
            <Coffee className="size-4" aria-hidden="true" />
            {isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
          </Button>
          <Link
            to="/admin/login"
            data-ocid="admin.guard.staff_login_link"
            className="text-xs font-medium text-primary underline-offset-4 transition-smooth hover:underline"
          >
            Open the staff sign-in page
          </Link>
        </div>
      </GuardShell>
    );
  }

  if (roleQuery.isError) {
    return (
      <GuardShell>
        <div
          data-ocid="admin.guard.error_state"
          className="flex flex-col items-center gap-5"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              We couldn't verify your access
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The backend did not respond. Check your connection and try again.
            </p>
          </div>
          <Button
            type="button"
            data-ocid="admin.guard.retry_button"
            onClick={() => void roleQuery.refetch()}
            className="rounded-full bg-accent text-accent-foreground transition-smooth hover:bg-accent/90"
          >
            Try again
          </Button>
        </div>
      </GuardShell>
    );
  }

  if (roleQuery.data !== CallerRole.admin) {
    return (
      <GuardShell>
        <div
          data-ocid="admin.guard.denied_state"
          className="flex flex-col items-center gap-5"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Admins only
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your account doesn't have administrator access to Kape Corner. Ask
              the shop owner to grant you access.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border transition-smooth hover:bg-secondary"
            >
              <Link to="/" data-ocid="admin.guard.home_link">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to store
              </Link>
            </Button>
            <Button
              type="button"
              data-ocid="admin.guard.signout_button"
              onClick={() => {
                clear();
                queryClient.clear();
              }}
              className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
            >
              Sign out
            </Button>
          </div>
        </div>
      </GuardShell>
    );
  }

  return <>{children}</>;
}
