import { createActor } from "@/backend";
import type { StoredFile } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { ExternalBlob } from "@caffeineai/object-storage";
import type { CallerRole, OrderError } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export { createActor };

/** Shared actor accessor so every hook reads the same backend connection. */
export function useBackendActor() {
  return useActor(createActor);
}

export const callerRoleKey = ["caller-role"] as const;

/**
 * Resolve the signed-in caller's audience (`admin` / `customer` / `anonymous`).
 *
 * `getCallerRole()` never traps, so an unregistered session resolves to
 * `anonymous` instead of erroring. The query only runs once the actor is ready
 * and the caller is authenticated; anonymous visitors are reported directly.
 */
export function useCallerRole(isAuthenticated: boolean) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<CallerRole>({
    queryKey: callerRoleKey,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getCallerRole();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    retry: false,
  });
}

/**
 * Bootstrap the caller's staff access from the staff portal.
 *
 * `_initialize_access_control()` is the only backend path that grants the
 * `admin` role: the first non-anonymous caller to invoke it becomes the shop
 * admin, and every later caller is assigned the non-admin `user` role. The
 * customer portal's `registerCustomer()` always assigns `user`, so it can
 * never claim the admin slot.
 */
export function useInitializeAccessControl() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor._initialize_access_control();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: callerRoleKey });
    },
  });
}

/**
 * Register the caller as a customer account.
 *
 * The customer portal's registration path always assigns the `user` role, so a
 * customer signing in first can never claim the shop's admin account.
 */
export function useRegisterCustomer() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.registerCustomer();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: callerRoleKey });
    },
  });
}

/**
 * The generated bindings type `StoredFile.blob` as `FileRef` (Uint8Array), but
 * the runtime actor decodes it into an `ExternalBlob`. Narrow it back so
 * `getDirectURL()` and `getBytes()` are available at use sites.
 */
export function storedFileBlob(file: StoredFile): ExternalBlob {
  return file.blob as unknown as ExternalBlob;
}

/** Build a `StoredFile` from a browser File for upload. */
export async function storedFileFromFile(file: File): Promise<StoredFile> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return {
    blob: ExternalBlob.fromBytes(
      bytes,
      file.type,
      file.name,
    ) as unknown as StoredFile["blob"],
    mimeType: file.type,
    filename: file.name,
  };
}

/** Turn a backend OrderError variant into a customer-facing message. */
export function describeOrderError(error: OrderError): string {
  switch (error.__kind__) {
    case "emptyCart":
      return "Your cart is empty. Add a drink before placing an order.";
    case "invalidCustomerInfo":
      return error.invalidCustomerInfo || "Please check your contact details.";
    case "invalidOrderType":
      return error.invalidOrderType || "Please choose dine-in or take-out.";
    case "invalidPayment":
      return error.invalidPayment || "Please check your payment details.";
    case "invalidStatusTransition":
      return `That status change is not allowed from ${error.invalidStatusTransition.from}.`;
    case "notAuthorized":
      return "You are not authorized to perform this action.";
    case "productUnavailable":
      return "One of the items in your cart is no longer available.";
    case "unknownOrder":
      return `We could not find order ${error.unknownOrder}.`;
    case "unknownProduct":
      return "One of the items in your cart no longer exists.";
    default:
      return "Something went wrong. Please try again.";
  }
}
