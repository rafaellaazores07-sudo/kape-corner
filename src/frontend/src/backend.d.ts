import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AddOn {
    id: Id;
    name: string;
    available: boolean;
    price: Centavos;
}
export interface AddOnInput {
    name: string;
    available: boolean;
    price: Centavos;
}
export interface Category {
    id: Id;
    sortOrder: bigint;
    name: string;
}
export interface CategoryInput {
    sortOrder: bigint;
    name: string;
}
export interface Cell {
    value: Value;
    name: string;
}
export type Centavos = bigint;
export interface CustomerInfo {
    fullName: string;
    mobileNumber: string;
    email: string;
}
export interface DashboardStats {
    totalOrders: bigint;
    pendingOrders: bigint;
    totalSales: Centavos;
    todaysSales: Centavos;
    completedOrders: bigint;
}
export interface DineInDetails {
    numberOfCustomers: bigint;
    tableNumber: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type FileRef = Uint8Array;
export type Id = bigint;
export interface LineCustomization {
    sugarLevel?: string;
    milkOption?: string;
    addOnIds: Array<Id>;
    sizeId?: Id;
    iceLevel?: string;
}
export interface Menu {
    categories: Array<Category>;
    sizes: Array<SizeOption>;
    addOns: Array<AddOn>;
    products: Array<Product>;
}
export interface Order {
    status: OrderStatus;
    total: Centavos;
    customer: CustomerInfo;
    createdAt: Timestamp;
    orderType: OrderType;
    serviceFee: Centavos;
    takeOut?: TakeOutDetails;
    updatedAt: Timestamp;
    specialInstructions: string;
    dineIn?: DineInDetails;
    items: Array<OrderItem>;
    orderNumber: string;
    payment: PaymentInfo;
    subtotal: Centavos;
}
export type OrderError = {
    __kind__: "invalidStatusTransition";
    invalidStatusTransition: {
        to: OrderStatus;
        from: OrderStatus;
    };
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "unknownOrder";
    unknownOrder: string;
} | {
    __kind__: "invalidCustomerInfo";
    invalidCustomerInfo: string;
} | {
    __kind__: "productUnavailable";
    productUnavailable: Id;
} | {
    __kind__: "unknownProduct";
    unknownProduct: Id;
} | {
    __kind__: "invalidOrderType";
    invalidOrderType: string;
} | {
    __kind__: "invalidPayment";
    invalidPayment: string;
} | {
    __kind__: "emptyCart";
    emptyCart: null;
};
export interface OrderFilter {
    status?: OrderStatus;
    orderType?: OrderType;
}
export interface OrderItem {
    lineTotal: Centavos;
    productId: Id;
    productName: string;
    quantity: bigint;
    unitPrice: Centavos;
    customization: LineCustomization;
}
export interface OrderSummary {
    customerName: string;
    status: OrderStatus;
    total: Centavos;
    paymentMethod: PaymentMethod;
    createdAt: Timestamp;
    orderType: OrderType;
    orderNumber: string;
}
export interface PaymentInfo {
    method: PaymentMethod;
    referenceNumber?: string;
    proof?: StoredFile;
}
export interface PaymentSettings {
    mayaNumber: string;
    gcashQr?: StoredFile;
    gcashNumber: string;
    mayaQr?: StoredFile;
}
export interface PaymentSettingsInput {
    mayaNumber: string;
    gcashQr?: StoredFile;
    gcashNumber: string;
    mayaQr?: StoredFile;
}
export interface PlaceOrderInput {
    customer: CustomerInfo;
    orderType: OrderType;
    takeOut?: TakeOutDetails;
    specialInstructions: string;
    dineIn?: DineInDetails;
    items: Array<OrderItem>;
    payment: PaymentInfo;
}
export interface Product {
    id: Id;
    categoryId: Id;
    name: string;
    description: string;
    available: boolean;
    addOnIds: Array<Id>;
    sizeOptionIds: Array<Id>;
    image?: StoredFile;
    price: Centavos;
}
export interface ProductInput {
    categoryId: Id;
    name: string;
    description: string;
    available: boolean;
    addOnIds: Array<Id>;
    sizeOptionIds: Array<Id>;
    image?: StoredFile;
    price: Centavos;
}
export type Result = {
    __kind__: "ok";
    ok: Order;
} | {
    __kind__: "err";
    err: OrderError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: OrderError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface SizeOption {
    id: Id;
    surcharge: Centavos;
    name: string;
}
export interface SizeOptionInput {
    surcharge: Centavos;
    name: string;
}
export interface StoredFile {
    blob: FileRef;
    mimeType: string;
    filename: string;
}
export interface TakeOutDetails {
    pickupTime: string;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum CallerRole {
    admin = "admin",
    customer = "customer",
    anonymous = "anonymous"
}
export enum OrderStatus {
    orderConfirmed = "orderConfirmed",
    readyForPickup = "readyForPickup",
    preparing = "preparing",
    cancelled = "cancelled",
    completed = "completed",
    orderReceived = "orderReceived",
    paymentVerification = "paymentVerification"
}
export enum OrderType {
    takeOut = "takeOut",
    dineIn = "dineIn"
}
export enum PaymentMethod {
    cash = "cash",
    maya = "maya",
    gcash = "gcash"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Admin: cancel an order.
     */
    cancelOrder(orderNumber: string): Promise<Result>;
    /**
     * / Admin: create an add-on.
     */
    createAddOn(input: AddOnInput): Promise<Id>;
    /**
     * / Admin: create a category.
     */
    createCategory(input: CategoryInput): Promise<Id>;
    /**
     * / Admin: create a product.
     */
    createProduct(input: ProductInput): Promise<Id>;
    /**
     * / Admin: create a size option.
     */
    createSizeOption(input: SizeOptionInput): Promise<Id>;
    /**
     * / Admin: delete an add-on.
     */
    deleteAddOn(id: Id): Promise<boolean>;
    /**
     * / Admin: delete a category.
     */
    deleteCategory(id: Id): Promise<boolean>;
    /**
     * / Admin: delete a product.
     */
    deleteProduct(id: Id): Promise<boolean>;
    /**
     * / Admin: delete a size option.
     */
    deleteSizeOption(id: Id): Promise<boolean>;
    execute(qJson: string): Promise<Result__1>;
    /**
     * / Static Markdown documentation of this backend's public API.
     */
    getApiDoc(): Promise<string>;
    /**
     * / Resolve the caller's audience for role-aware routing.
     * /
     * / Never traps: an anonymous or not-yet-registered caller resolves to
     * / `#anonymous`, a registered customer to `#customer`, and a registered
     * / staff account to `#admin`.
     */
    getCallerRole(): Promise<CallerRole>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Admin: dashboard counters.
     */
    getDashboardStats(): Promise<DashboardStats>;
    /**
     * / Public storefront menu.
     */
    getMenu(): Promise<Menu>;
    /**
     * / Track an order by its order number.
     */
    getOrder(orderNumber: string): Promise<Order | null>;
    /**
     * / Public: configurable shop payment settings.
     */
    getPaymentSettings(): Promise<PaymentSettings>;
    /**
     * / Public product lookup.
     */
    getProduct(id: Id): Promise<Product | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Admin: list orders, optionally filtered.
     */
    listOrders(filter: OrderFilter): Promise<Array<OrderSummary>>;
    /**
     * / Place an order. Open to any caller, including anonymous guests.
     */
    placeOrder(input: PlaceOrderInput): Promise<Result_1>;
    /**
     * / Register the caller as a customer account.
     * /
     * / This is the customer portal's registration path. It always assigns the
     * / `#user` role, so a customer signing in first can never claim the shop's
     * / admin account — only the staff portal's `_initialize_access_control`
     * / path can promote the first sign-in to `#admin`. Calling it again for an
     * / already-registered caller is a no-op.
     */
    registerCustomer(): Promise<void>;
    schema(): Promise<string>;
    /**
     * / Admin: update an add-on.
     */
    updateAddOn(id: Id, input: AddOnInput): Promise<boolean>;
    /**
     * / Admin: update a category.
     */
    updateCategory(id: Id, input: CategoryInput): Promise<boolean>;
    /**
     * / Admin: change an order's status.
     */
    updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<Result>;
    /**
     * / Admin: update shop payment settings.
     */
    updatePaymentSettings(input: PaymentSettingsInput): Promise<PaymentSettings>;
    /**
     * / Admin: update a product.
     */
    updateProduct(id: Id, input: ProductInput): Promise<boolean>;
    /**
     * / Admin: update a size option.
     */
    updateSizeOption(id: Id, input: SizeOptionInput): Promise<boolean>;
    /**
     * / Admin: verify a GCash/Maya payment.
     */
    verifyPayment(orderNumber: string): Promise<Result>;
}
