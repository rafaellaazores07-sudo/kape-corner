import { useBackendActor } from "@/lib/backend";
import type {
  DashboardStats,
  Order,
  OrderFilter,
  OrderStatus,
  OrderSummary,
  PaymentSettings,
  PaymentSettingsInput,
  PlaceOrderInput,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const orderKeys = {
  all: ["orders"] as const,
  list: (filter: OrderFilter) => ["orders", "list", filter] as const,
  detail: (orderNumber: string) => ["orders", "detail", orderNumber] as const,
  stats: ["orders", "stats"] as const,
};

/** Track a single order by its order number. */
export function useOrder(orderNumber: string | undefined) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Order | null>({
    queryKey: orderKeys.detail(orderNumber ?? ""),
    queryFn: async () => {
      if (!actor || !orderNumber) return null;
      return actor.getOrder(orderNumber);
    },
    enabled: !!actor && !isFetching && !!orderNumber,
  });
}

/** Admin: list orders, optionally filtered by status or order type. */
export function useOrders(filter: OrderFilter = {}) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<OrderSummary[]>({
    queryKey: orderKeys.list(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Admin: dashboard counters. */
export function useDashboardStats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DashboardStats>({
    queryKey: orderKeys.stats,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Place an order. Open to guests. */
export function usePlaceOrder() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.placeOrder(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Admin: change an order's status. */
export function useUpdateOrderStatus() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderNumber,
      status,
    }: {
      orderNumber: string;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateOrderStatus(orderNumber, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Admin: cancel an order. */
export function useCancelOrder() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderNumber: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.cancelOrder(orderNumber);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Admin: verify a GCash / Maya payment. */
export function useVerifyPayment() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderNumber: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.verifyPayment(orderNumber);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Admin: update shop payment settings. */
export function useUpdatePaymentSettings() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentSettingsInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updatePaymentSettings(input);
    },
    onSuccess: (data: PaymentSettings) => {
      queryClient.setQueryData(["payment-settings"], data);
    },
  });
}
