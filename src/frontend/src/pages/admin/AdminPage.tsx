import { AdminGuard } from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardTab } from "@/pages/admin/DashboardTab";
import { OrdersTab } from "@/pages/admin/OrdersTab";
import { PaymentsTab } from "@/pages/admin/PaymentsTab";
import { ProductsTab } from "@/pages/admin/ProductsTab";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Store,
  Wallet,
} from "lucide-react";

const TABS = [
  { value: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { value: "products", label: "Products", Icon: Package },
  { value: "orders", label: "Orders", Icon: Receipt },
  { value: "payments", label: "Payments", Icon: Wallet },
] as const;

function shortenPrincipal(principal: string): string {
  if (principal.length <= 18) return principal;
  return `${principal.slice(0, 9)}…${principal.slice(-6)}`;
}

function AdminHeader() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const principal = identity?.getPrincipal().toString() ?? null;

  const handleSignOut = () => {
    clear();
    queryClient.clear();
    void navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Staff / Admin
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Shop dashboard
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Manage the menu, track incoming orders, verify GCash and Maya
          payments, and keep the shop running smoothly.
        </p>
        {principal && (
          <p className="text-xs text-muted-foreground">
            Signed in as{" "}
            <span
              data-ocid="admin.identity"
              title={principal}
              className="font-mono text-foreground"
            >
              {shortenPrincipal(principal)}
            </span>
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-border transition-smooth hover:bg-secondary"
        >
          <Link to="/" data-ocid="admin.storefront_link">
            <Store className="size-4" aria-hidden="true" />
            View storefront
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.signout_button"
          onClick={handleSignOut}
          className="rounded-full border-border transition-smooth hover:bg-secondary"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function AdminPage() {
  return (
    <AdminGuard>
      <div data-ocid="admin.page" className="bg-background">
        <div className="container space-y-8 py-10 md:py-14">
          <AdminHeader />

          <Tabs defaultValue="dashboard" className="gap-6">
            <TabsList
              data-ocid="admin.tabs"
              className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-secondary p-1.5 sm:w-fit"
            >
              {TABS.map(({ value, label, Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  data-ocid={`admin.tab.${value}`}
                  className="h-10 flex-none gap-2 rounded-xl px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-subtle"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard" data-ocid="admin.dashboard.panel">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="products" data-ocid="admin.products.panel">
              <ProductsTab />
            </TabsContent>
            <TabsContent value="orders" data-ocid="admin.orders.panel">
              <OrdersTab />
            </TabsContent>
            <TabsContent value="payments" data-ocid="admin.payments.panel">
              <PaymentsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}
