import { beforeEach, describe, expect, it } from "vitest";

import {
  type CheckoutDraft,
  isCheckoutDraftComplete,
  useCheckoutStore,
} from "@/store/checkout";
import { OrderType } from "@/types";

function draft(overrides: Partial<CheckoutDraft> = {}): CheckoutDraft {
  return {
    orderType: undefined,
    customer: { fullName: "", mobileNumber: "", email: "" },
    dineIn: { tableNumber: "", numberOfCustomers: 2 },
    takeOut: { customerName: "", contactNumber: "", pickupTime: "" },
    specialInstructions: "",
    ...overrides,
  };
}

const validCustomer = {
  fullName: "Maria Santos",
  mobileNumber: "0917 555 0142",
  email: "maria@example.ph",
};

describe("isCheckoutDraftComplete", () => {
  it("is incomplete without an order type", () => {
    expect(isCheckoutDraftComplete(draft({ customer: validCustomer }))).toBe(
      false,
    );
  });

  it("is incomplete when any customer field is blank", () => {
    expect(
      isCheckoutDraftComplete(
        draft({
          orderType: OrderType.dineIn,
          customer: { ...validCustomer, email: "   " },
          dineIn: { tableNumber: "7", numberOfCustomers: 2 },
        }),
      ),
    ).toBe(false);
  });

  it("requires a table number and positive party size for dine-in", () => {
    const base = draft({
      orderType: OrderType.dineIn,
      customer: validCustomer,
      dineIn: { tableNumber: "7", numberOfCustomers: 2 },
    });
    expect(isCheckoutDraftComplete(base)).toBe(true);
    expect(
      isCheckoutDraftComplete({
        ...base,
        dineIn: { tableNumber: "", numberOfCustomers: 2 },
      }),
    ).toBe(false);
    expect(
      isCheckoutDraftComplete({
        ...base,
        dineIn: { tableNumber: "7", numberOfCustomers: 0 },
      }),
    ).toBe(false);
  });

  it("requires take-out name, contact, and pickup time", () => {
    const base = draft({
      orderType: OrderType.takeOut,
      customer: validCustomer,
      takeOut: {
        customerName: "Maria",
        contactNumber: "0917 555 0142",
        pickupTime: "3:40 PM",
      },
    });
    expect(isCheckoutDraftComplete(base)).toBe(true);
    expect(
      isCheckoutDraftComplete({
        ...base,
        takeOut: { ...base.takeOut, pickupTime: "" },
      }),
    ).toBe(false);
  });
});

describe("useCheckoutStore", () => {
  beforeEach(() => {
    useCheckoutStore.getState().reset();
  });

  it("stores the order type and customer details", () => {
    const store = useCheckoutStore.getState();
    store.setOrderType(OrderType.takeOut);
    store.setCustomer(validCustomer);
    store.setTakeOut({
      customerName: "Maria",
      contactNumber: "0917 555 0142",
      pickupTime: "3:40 PM",
    });

    const state = useCheckoutStore.getState();
    expect(state.orderType).toBe("takeOut");
    expect(state.customer.fullName).toBe("Maria Santos");
    expect(isCheckoutDraftComplete(state)).toBe(true);
  });

  it("resets back to an empty draft", () => {
    const store = useCheckoutStore.getState();
    store.setOrderType(OrderType.dineIn);
    store.setSpecialInstructions("Less ice");
    store.reset();

    const state = useCheckoutStore.getState();
    expect(state.orderType).toBeUndefined();
    expect(state.specialInstructions).toBe("");
    expect(isCheckoutDraftComplete(state)).toBe(false);
  });
});
