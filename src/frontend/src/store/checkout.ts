import type { CustomerInfo, OrderType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Dine-in specifics captured on the checkout page. */
export interface DineInDraft {
  tableNumber: string;
  numberOfCustomers: number;
}

/** Take-out specifics captured on the checkout page. */
export interface TakeOutDraft {
  customerName: string;
  contactNumber: string;
  pickupTime: string;
}

export interface CheckoutDraft {
  orderType?: OrderType;
  customer: CustomerInfo;
  dineIn: DineInDraft;
  takeOut: TakeOutDraft;
  specialInstructions: string;
}

interface CheckoutStore extends CheckoutDraft {
  setOrderType: (orderType: OrderType) => void;
  setCustomer: (customer: CustomerInfo) => void;
  setDineIn: (dineIn: DineInDraft) => void;
  setTakeOut: (takeOut: TakeOutDraft) => void;
  setSpecialInstructions: (value: string) => void;
  reset: () => void;
}

const EMPTY_DRAFT: CheckoutDraft = {
  orderType: undefined,
  customer: { fullName: "", mobileNumber: "", email: "" },
  dineIn: { tableNumber: "", numberOfCustomers: 2 },
  takeOut: { customerName: "", contactNumber: "", pickupTime: "" },
  specialInstructions: "",
};

/**
 * Checkout draft shared between the checkout and payment pages.
 * Persisted so a refresh mid-checkout never loses the customer's details.
 */
export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      ...EMPTY_DRAFT,
      setOrderType: (orderType) => set({ orderType }),
      setCustomer: (customer) => set({ customer }),
      setDineIn: (dineIn) => set({ dineIn }),
      setTakeOut: (takeOut) => set({ takeOut }),
      setSpecialInstructions: (specialInstructions) =>
        set({ specialInstructions }),
      reset: () => set({ ...EMPTY_DRAFT }),
    }),
    { name: "kape-corner-checkout" },
  ),
);

/** True when the draft holds everything the payment page needs. */
export function isCheckoutDraftComplete(draft: CheckoutDraft): boolean {
  if (!draft.orderType) return false;
  const { fullName, mobileNumber, email } = draft.customer;
  if (!fullName.trim() || !mobileNumber.trim() || !email.trim()) return false;
  if (draft.orderType === "dineIn") {
    return (
      draft.dineIn.tableNumber.trim().length > 0 &&
      draft.dineIn.numberOfCustomers > 0
    );
  }
  return (
    draft.takeOut.customerName.trim().length > 0 &&
    draft.takeOut.contactNumber.trim().length > 0 &&
    draft.takeOut.pickupTime.trim().length > 0
  );
}
