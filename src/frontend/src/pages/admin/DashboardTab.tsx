import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useOrders } from "@/hooks/use-orders";
import { formatPeso, formatTime, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderStatus, OrderType } from "@/types";
import {
  CheckCircle2,
  Clock,
  PhilippinePeso,
  Receipt,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tile {
  key: string;
  label: string;
  value: string;
  hint: string;
  Icon: LucideIcon;
  tone: "primary" | "accent" | "success" | "muted";
}

const TONE_CLASSES: Record<Tile["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  muted: "bg-secondary text-secondary-foreground",
};

function StatTile({ tile, index }: { tile: Tile; index: number }) {
  const { Icon } = tile;
  return (
    <Card
      data-ocid={`admin.dashboard.tile.${index + 1}`}
      className="rounded-2xl border-border bg-card shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {tile.label}
          </p>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground">
            {tile.value}
          </p>
          <p className="text-xs text-muted-foreground">{tile.hint}</p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            TONE_CLASSES[tile.tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  const ids = Array.from({ length: 5 }, (_, i) => `dashboard-skeleton-${i}`);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ids.map((id) => (
        <Skeleton key={id} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}

export function DashboardTab() {
  const statsQuery = useDashboardStats();
  const recentQuery = useOrders({});

  const stats = statsQuery.data;
  const tiles: Tile[] = [
    {
      key: "total",
      label: "Total Orders",
      value: stats ? String(stats.totalOrders) : "—",
      hint: "All orders placed",
      Icon: Receipt,
      tone: "primary",
    },
    {
      key: "pending",
      label: "Pending Orders",
      value: stats ? String(stats.pendingOrders) : "—",
      hint: "Awaiting preparation",
      Icon: Clock,
      tone: "accent",
    },
    {
      key: "completed",
      label: "Completed Orders",
      value: stats ? String(stats.completedOrders) : "—",
      hint: "Served and closed",
      Icon: CheckCircle2,
      tone: "success",
    },
    {
      key: "today",
      label: "Today's Sales",
      value: stats ? formatPeso(stats.todaysSales) : "—",
      hint: "Since midnight",
      Icon: TrendingUp,
      tone: "accent",
    },
    {
      key: "sales",
      label: "Total Sales",
      value: stats ? formatPeso(stats.totalSales) : "—",
      hint: "Lifetime revenue",
      Icon: PhilippinePeso,
      tone: "primary",
    },
  ];

  const recent = (recentQuery.data ?? []).slice(0, 6);

  return (
    <div className="space-y-8">
      {statsQuery.isLoading ? (
        <DashboardSkeleton />
      ) : statsQuery.isError ? (
        <Card
          data-ocid="admin.dashboard.error_state"
          className="rounded-2xl border-destructive/30 bg-destructive/5"
        >
          <CardContent className="p-6 text-sm text-destructive">
            We couldn't load the dashboard counters. Refresh the page to try
            again.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, index) => (
            <StatTile key={tile.key} tile={tile} index={index} />
          ))}
        </div>
      )}

      <Card className="rounded-2xl border-border bg-card shadow-subtle">
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg font-bold tracking-tight">
            Recent orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentQuery.isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }, (_, i) => `recent-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-12 rounded-xl" />
                ),
              )}
            </div>
          ) : recent.length === 0 ? (
            <p
              data-ocid="admin.dashboard.empty_state"
              className="p-6 text-sm text-muted-foreground"
            >
              No orders yet. New orders will appear here as customers check out.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((order, index) => (
                <li
                  key={order.orderNumber}
                  data-ocid={`admin.dashboard.recent.item.${index + 1}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-mono text-sm font-semibold text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customerName} ·{" "}
                      {order.orderType === OrderType.dineIn
                        ? "Dine-in"
                        : "Take-out"}{" "}
                      · {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="rounded-full text-[0.6875rem] font-semibold uppercase tracking-wider"
                    >
                      {humanize(order.status)}
                    </Badge>
                    <span className="font-display text-base font-bold text-accent">
                      {formatPeso(order.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Statuses tracked:{" "}
        {[
          OrderStatus.orderReceived,
          OrderStatus.paymentVerification,
          OrderStatus.orderConfirmed,
          OrderStatus.preparing,
          OrderStatus.readyForPickup,
          OrderStatus.completed,
        ]
          .map(humanize)
          .join(" → ")}
      </p>
    </div>
  );
}
