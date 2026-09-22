mixin () {
  /// Static Markdown documentation of this backend's public API.
  public query func getApiDoc() : async Text {
    "# Coffee Shop Ordering Backend\n" #
    "\n" #
    "Backend for a Philippine coffee-shop storefront: a public menu, guest checkout\n" #
    "with Dine-In / Take-Out, GCash / Maya / Cash payment selection, order tracking,\n" #
    "and an admin surface for products, orders, payments, and sales.\n" #
    "\n" #
    "All monetary amounts are **centavos** (`Centavos = Nat`), i.e. \u{20B1}1.00 = 100.\n" #
    "Timestamps are **nanoseconds since the Unix epoch** (`Timestamp = Nat`).\n" #
    "Identifiers (`Id`) are `Nat`. Order numbers are `Text` of the form\n" #
    "`YYYYMMDD-NNN` (for example `20260922-001`).\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "The app's frontend pins an Internet Identity **derivation origin**, published at\n" #
    "`/.well-known/ii-derivation-origin` when available. An agent that already holds\n" #
    "the user's Internet Identity authorization derives the correct per-app principal\n" #
    "against that origin (for example `icp identity link web <name> --app <host>`).\n" #
    "Such a delegation acts with the user's full authority in this app until it\n" #
    "expires.\n" #
    "\n" #
    "Registration gates the admin surface. A direct API caller must register before\n" #
    "any role-guarded call: call `_initialize_access_control` once as a signed-in\n" #
    "caller. The first initializer receives the `admin` role; every subsequent caller\n" #
    "receives the `user` role. An unregistered or anonymous caller hitting a guarded\n" #
    "endpoint is rejected by the authorization mixin's trap (the caller is not\n" #
    "authorized for the required role).\n" #
    "\n" #
    "Customer and staff accounts are separate. The customer portal registers through\n" #
    "`registerCustomer()`, which always assigns the `user` role and can never claim\n" #
    "the first-admin slot. Only the staff portal's `_initialize_access_control` path\n" #
    "can promote the first sign-in to `admin`. Use `getCallerRole()` to route a\n" #
    "caller: it never traps and resolves an anonymous or not-yet-registered caller to\n" #
    "`#anonymous`, a registered customer to `#customer`, and a registered staff\n" #
    "account to `#admin`.\n" #
    "\n" #
    "A caller can be unregistered even when the app already knows it: registration\n" #
    "happens only when a caller signs in through the app's own frontend, so a\n" #
    "principal that never did so is unregistered even when it belongs to the app's\n" #
    "owner. A signed-in caller derived against a different origin is a different\n" #
    "principal than the one the frontend registered.\n" #
    "\n" #
    "## Public methods\n" #
    "\n" #
    "### Accounts (no sign-in required)\n" #
    "\n" #
    "- `registerCustomer() : shared -> ()` \u{2014} register the caller as a customer\n" #
    "  account. Always assigns the `user` role; a customer can never become admin\n" #
    "  through this path. Idempotent: calling it again for an already-registered\n" #
    "  caller is a no-op. An anonymous caller is ignored.\n" #
    "- `getCallerRole() : query -> CallerRole` \u{2014} the caller's audience:\n" #
    "  `#anonymous`, `#customer`, or `#admin`. Never traps, so it is safe to call\n" #
    "  before registration to decide where to route a signed-in user.\n" #
    "\n" #
    "### Storefront (no sign-in required)\n" #
    "\n" #
    "- `getMenu() : query -> Menu` \u{2014} the full catalogue: categories, products, size\n" #
    "  options, and add-ons. Prices are centavos; `image` is an optional stored file.\n" #
    "- `getProduct(id : Id) : query -> ?Product` \u{2014} a single product, or `null`.\n" #
    "- `getPaymentSettings() : query -> PaymentSettings` \u{2014} the shop's configured\n" #
    "  GCash / Maya numbers and QR codes. These are **placeholders** until an admin\n" #
    "  sets them; never real credentials.\n" #
    "- `placeOrder(input : PlaceOrderInput) : shared -> Result<Text, OrderError>` \u{2014}\n" #
    "  place an order as any caller, including an anonymous guest. Returns the\n" #
    "  generated order number on success. The backend re-prices every line from the\n" #
    "  stored menu; client-supplied prices are not trusted.\n" #
    "- `getOrder(orderNumber : Text) : query -> ?Order` \u{2014} track an order by its\n" #
    "  order number. Returns `null` for an unknown number.\n" #
    "\n" #
    "### Admin (requires the `admin` role)\n" #
    "\n" #
    "Menu management:\n" #
    "\n" #
    "- `createProduct(input) -> Id`, `updateProduct(id, input) -> Bool`,\n" #
    "  `deleteProduct(id) -> Bool`\n" #
    "- `createCategory(input) -> Id`, `updateCategory(id, input) -> Bool`,\n" #
    "  `deleteCategory(id) -> Bool`\n" #
    "- `createSizeOption(input) -> Id`, `updateSizeOption(id, input) -> Bool`,\n" #
    "  `deleteSizeOption(id) -> Bool`\n" #
    "- `createAddOn(input) -> Id`, `updateAddOn(id, input) -> Bool`,\n" #
    "  `deleteAddOn(id) -> Bool`\n" #
    "\n" #
    "Order management:\n" #
    "\n" #
    "- `listOrders(filter : OrderFilter) : query -> [OrderSummary]` \u{2014} orders,\n" #
    "  optionally filtered by `status` and `orderType`.\n" #
    "- `updateOrderStatus(orderNumber, status) -> Result<Order, OrderError>` \u{2014} move\n" #
    "  an order along its lifecycle.\n" #
    "- `cancelOrder(orderNumber) -> Result<Order, OrderError>` \u{2014} cancel an order.\n" #
    "- `verifyPayment(orderNumber) -> Result<Order, OrderError>` \u{2014} mark a GCash or\n" #
    "  Maya payment as verified.\n" #
    "- `getDashboardStats() : query -> DashboardStats` \u{2014} total orders, pending\n" #
    "  orders, completed orders, today's sales, and total sales (centavos).\n" #
    "- `updatePaymentSettings(input) -> PaymentSettings` \u{2014} set the shop's GCash /\n" #
    "  Maya numbers and QR codes.\n" #
    "\n" #
    "## Order lifecycle\n" #
    "\n" #
    "An order moves through these statuses:\n" #
    "\n" #
    "1. `#orderReceived` \u{2014} the order was placed.\n" #
    "2. `#paymentVerification` \u{2014} awaiting admin verification of a GCash / Maya\n" #
    "   reference number and proof of payment.\n" #
    "3. `#orderConfirmed` \u{2014} payment verified (or Cash accepted).\n" #
    "4. `#preparing` \u{2014} the kitchen is preparing the order.\n" #
    "5. `#readyForPickup` \u{2014} ready for the customer.\n" #
    "6. `#completed` \u{2014} fulfilled.\n" #
    "7. `#cancelled` \u{2014} cancelled by an admin.\n" #
    "\n" #
    "`#completed` and `#cancelled` are terminal. An invalid transition returns\n" #
    "`#invalidStatusTransition { from; to }` rather than trapping.\n" #
    "\n" #
    "## Polling\n" #
    "\n" #
    "`getOrder` is a query, so it is cheap to poll. Poll it to follow an order's\n" #
    "status; there is no push notification. `getDashboardStats` and `listOrders` are\n" #
    "also queries and safe to poll for the admin dashboard.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `placeOrder` is **not idempotent**: each successful call creates a new order\n" #
    "  with a new order number. Retrying after a timeout can create a duplicate\n" #
    "  order \u{2014} re-check with `getOrder` before retrying.\n" #
    "- `updateOrderStatus`, `cancelOrder`, and `verifyPayment` are idempotent in\n" #
    "  effect: re-applying the same status or re-verifying an already-verified\n" #
    "  payment leaves the order in the same state.\n" #
    "- `deleteProduct`, `deleteCategory`, `deleteSizeOption`, and `deleteAddOn`\n" #
    "  return `false` when the id does not exist; deleting twice is safe.\n" #
    "- `updatePaymentSettings` overwrites the whole settings record; send the\n" #
    "  complete record, not a partial patch.\n" #
    "- `registerCustomer` is idempotent: re-registering an existing caller leaves\n" #
    "  the account unchanged and never changes its role.\n" #
    "\n" #
    "## Errors and limits\n" #
    "\n" #
    "- `OrderError` is a variant: `#emptyCart`, `#invalidCustomerInfo(Text)`,\n" #
    "  `#invalidOrderType(Text)`, `#invalidPayment(Text)`, `#unknownProduct(Id)`,\n" #
    "  `#productUnavailable(Id)`, `#unknownOrder(Text)`,\n" #
    "  `#invalidStatusTransition({ from; to })`, `#notAuthorized`.\n" #
    "- Admin endpoints trap for a caller without the `admin` role; they do not\n" #
    "  return `#notAuthorized` for a missing role.\n" #
    "- `placeOrder` validates the customer name, mobile number, and email, requires\n" #
    "  either Dine-In details (table number, number of customers) or Take-Out\n" #
    "  details (pickup time), and requires a payment method. GCash and Maya orders\n" #
    "  should carry a reference number and proof of payment.\n" #
    "- Product images and payment proofs are stored off-chain; the backend stores\n" #
    "  only a reference plus filename and MIME type.\n" #
    "\n" #
    "## Non-obvious gotchas\n" #
    "\n" #
    "- Prices are **centavos**, not pesos: \u{20B1}250.00 is `25000`.\n" #
    "- `getMenu` returns the whole catalogue in one call; there is no pagination.\n" #
    "- `getOrder` is public and keyed only by order number \u{2014} anyone who knows an\n" #
    "  order number can read that order. Do not treat the order number as a secret\n" #
    "  beyond its unguessability.\n" #
    "- The GCash / Maya numbers returned by `getPaymentSettings` are configurable\n" #
    "  placeholders (`[SHOP_GCASH_NUMBER]`, `[SHOP_MAYA_NUMBER]`) until an admin\n" #
    "  sets them.\n" #
    "- `getDashboardStats` counts \"today\" by the shop's configured order date, not\n" #
    "  by the caller's timezone.\n";
  };
};
