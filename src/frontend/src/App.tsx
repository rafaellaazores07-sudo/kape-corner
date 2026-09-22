import { Layout } from "@/components/Layout";
import { StaffLoginPage } from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { AboutPage } from "@/pages/AboutPage";
import { AuthPage } from "@/pages/AuthPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { ContactPage } from "@/pages/ContactPage";
import { HomePage } from "@/pages/HomePage";
import { MenuPage } from "@/pages/MenuPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { TrackOrderPage } from "@/pages/TrackOrderPage";
import { AdminPage } from "@/pages/admin/AdminPage";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

function RoutePlaceholder({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { to: string; label: string };
}) {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Kape Corner
      </p>
      <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
        {title}
      </h1>
      <p className="max-w-xl text-base text-muted-foreground md:text-lg">
        {description}
      </p>
      {action && (
        <Button
          asChild
          className="rounded-full bg-accent text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
        >
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </section>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
  notFoundComponent: () => (
    <RoutePlaceholder
      title="We couldn't find that page"
      description="The page you're looking for may have moved. Head back to the menu and pick your next cup."
      action={{ to: "/menu", label: "Browse the menu" }}
    />
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const menuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/menu",
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string; category?: string; sort?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
  }),
  component: MenuPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: PaymentPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirmation",
  validateSearch: (search: Record<string, unknown>): { order?: string } => ({
    order: typeof search.order === "string" ? search.order : undefined,
  }),
  component: ConfirmationPage,
});

const trackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track",
  component: TrackOrderPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: StaffLoginPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  menuRoute,
  cartRoute,
  checkoutRoute,
  paymentRoute,
  confirmationRoute,
  trackRoute,
  aboutRoute,
  contactRoute,
  authRoute,
  adminRoute,
  adminLoginRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
