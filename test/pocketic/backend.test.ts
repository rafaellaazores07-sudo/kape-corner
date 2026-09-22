import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers the public storefront reads instead of trapping", async () => {
  const menu = await actor.getMenu();
  // The migration seeds the sample coffee-shop menu, so the storefront reads
  // return real data rather than an empty catalog.
  expect(menu.categories.map((category) => category.name)).toEqual([
    "Hot Coffee",
    "Iced Coffee",
    "Non-Coffee",
    "Pastries & Snacks",
  ]);
  expect(menu.products.length).toBeGreaterThan(0);
  expect(menu.sizes.length).toBeGreaterThan(0);
  expect(menu.addOns.length).toBeGreaterThan(0);

  const settings = await actor.getPaymentSettings();
  expect(settings).toMatchObject({ gcashNumber: expect.any(String) });
});

it("returns no order for an unknown order number", async () => {
  await expect(actor.getOrder("ORDER #20260922-999")).resolves.toEqual([]);
});

it("returns no product for an unknown id", async () => {
  await expect(actor.getProduct(999n)).resolves.toEqual([]);
});

it("rejects an empty cart through the real pricing path", async () => {
  const result = await actor.placeOrder({
    customer: {
      fullName: "Maria Santos",
      mobileNumber: "09175550142",
      email: "maria@example.ph",
    },
    orderType: { takeOut: null },
    takeOut: [{ pickupTime: "3:40 PM" }],
    specialInstructions: "",
    dineIn: [],
    items: [],
    payment: { method: { cash: null }, referenceNumber: [], proof: [] },
  });

  expect(result).toEqual({ err: { emptyCart: null } });
});

it("places an order and returns a trackable ORDER #YYYYMMDD-NNN number", async () => {
  const menu = await actor.getMenu();
  const product = menu.products[0];
  const size = menu.sizes.find((option) => option.surcharge > 0n);
  const addOn = menu.addOns[0];

  const result = await actor.placeOrder({
    customer: {
      fullName: "Maria Santos",
      mobileNumber: "09175550142",
      email: "maria@example.ph",
    },
    orderType: { takeOut: null },
    takeOut: [{ pickupTime: "3:40 PM" }],
    specialInstructions: "Less ice",
    dineIn: [],
    items: [
      {
        productId: product.id,
        productName: product.name,
        quantity: 2n,
        unitPrice: 0n,
        lineTotal: 0n,
        customization: {
          sizeId: size === undefined ? [] : [size.id],
          sugarLevel: ["50%"],
          iceLevel: ["Less ice"],
          milkOption: ["Oat milk"],
          addOnIds: [addOn.id],
        },
      },
    ],
    payment: { method: { cash: null }, referenceNumber: [], proof: [] },
  });

  // The declarations speak Candid's variant shape: `{ ok: string } | { err: ... }`.
  expect("ok" in result).toBe(true);
  if (!("ok" in result)) return;
  const orderNumber = result.ok;
  expect(orderNumber).toMatch(/^ORDER #\d{8}-\d{3}$/);

  // The order is retrievable by the number the confirmation page shows.
  const stored = await actor.getOrder(orderNumber);
  expect(stored).toHaveLength(1);
  const order = stored[0];
  expect(order.orderNumber).toBe(orderNumber);
  expect(order.status).toEqual({ orderReceived: null });
  expect(order.customer.fullName).toBe("Maria Santos");
  expect(order.items).toHaveLength(1);

  // The backend prices the line from authoritative menu data: base + size
  // surcharge + add-on, times quantity, plus the flat service fee.
  const expectedUnit =
    product.price + (size?.surcharge ?? 0n) + addOn.price;
  expect(order.items[0].unitPrice).toBe(expectedUnit);
  expect(order.items[0].lineTotal).toBe(expectedUnit * 2n);
  expect(order.subtotal).toBe(expectedUnit * 2n);
  expect(order.serviceFee).toBe(1000n);
  expect(order.total).toBe(expectedUnit * 2n + 1000n);
});

/**
 * The customer and staff portals must not be able to claim each other's role.
 * These are the only tests in the build that exercise the real per-caller role
 * logic; the frontend suite mocks `getCallerRole` entirely.
 */
it("resolves an anonymous caller to the anonymous role without trapping", async () => {
  // A freshly created actor calls as the anonymous principal until an identity
  // is set, so this is the unauthenticated storefront visitor.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.getCallerRole()).resolves.toEqual({ anonymous: null });
});

it("registers a customer through registerCustomer and never grants admin", async () => {
  const customer = createIdentity("customer-role-test");
  const customerActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  customerActor.setIdentity(customer);

  // Before registering, the caller has no role yet.
  await expect(customerActor.getCallerRole()).resolves.toEqual({
    anonymous: null,
  });

  await customerActor.registerCustomer();
  await expect(customerActor.getCallerRole()).resolves.toEqual({
    customer: null,
  });

  // Re-registering is idempotent and must not promote the caller.
  await customerActor.registerCustomer();
  await expect(customerActor.getCallerRole()).resolves.toEqual({
    customer: null,
  });
});

it("keeps the first-admin slot for the staff portal, not the customer portal", async () => {
  // A customer registering first must not consume the admin slot: only the
  // staff portal's `_initialize_access_control` can claim it.
  const firstCustomer = createIdentity("first-customer");
  const firstCustomerActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  firstCustomerActor.setIdentity(firstCustomer);
  await firstCustomerActor.registerCustomer();
  await expect(firstCustomerActor.getCallerRole()).resolves.toEqual({
    customer: null,
  });

  // The first staff-portal sign-in becomes the admin.
  const staff = createIdentity("first-staff");
  const staffActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  staffActor.setIdentity(staff);
  await staffActor._initialize_access_control();
  await expect(staffActor.getCallerRole()).resolves.toEqual({ admin: null });

  // A later staff-portal sign-in is non-admin.
  const laterStaff = createIdentity("later-staff");
  const laterStaffActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  laterStaffActor.setIdentity(laterStaff);
  await laterStaffActor._initialize_access_control();
  await expect(laterStaffActor.getCallerRole()).resolves.toEqual({
    customer: null,
  });
});
