import type {
  AddOn,
  AddOnInput,
  Category,
  CategoryInput,
  Centavos,
  CustomerInfo,
  DashboardStats,
  DineInDetails,
  Id,
  LineCustomization,
  Menu,
  Order,
  OrderError,
  OrderFilter,
  OrderItem,
  OrderSummary,
  PaymentInfo,
  PaymentSettings,
  PaymentSettingsInput,
  PlaceOrderInput,
  Product,
  ProductInput,
  SizeOption,
  SizeOptionInput,
  TakeOutDetails,
  Timestamp,
} from "@/backend";

export type {
  AddOn,
  AddOnInput,
  Category,
  CategoryInput,
  Centavos,
  CustomerInfo,
  DashboardStats,
  DineInDetails,
  Id,
  LineCustomization,
  Menu,
  Order,
  OrderError,
  OrderFilter,
  OrderItem,
  OrderSummary,
  PaymentInfo,
  PaymentSettings,
  PaymentSettingsInput,
  PlaceOrderInput,
  Product,
  ProductInput,
  SizeOption,
  SizeOptionInput,
  TakeOutDetails,
  Timestamp,
};

export {
  CallerRole,
  OrderStatus,
  OrderType,
  PaymentMethod,
  UserRole,
} from "@/backend";

/** A single configured line in the customer's cart. */
export interface CartLine {
  /** Stable identity for the configured line (product + customization). */
  lineId: string;
  productId: Id;
  productName: string;
  /** Base product price in centavos, before size surcharge and add-ons. */
  basePrice: Centavos;
  quantity: number;
  sizeId?: Id;
  sizeName?: string;
  sizeSurcharge: Centavos;
  sugarLevel?: string;
  iceLevel?: string;
  milkOption?: string;
  addOnIds: Id[];
  addOnNames: string[];
  addOnsTotal: Centavos;
  /** Unit price in centavos: base + size surcharge + add-ons. */
  unitPrice: Centavos;
  imageUrl?: string;
}

export interface CartTotals {
  subtotal: Centavos;
  serviceFee: Centavos;
  total: Centavos;
  itemCount: number;
}

export interface CartState {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "lineId" | "unitPrice">) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totals: () => CartTotals;
}

export interface MenuCategory extends Category {
  products: Product[];
}

export interface MenuView {
  categories: MenuCategory[];
  sizes: SizeOption[];
  addOns: AddOn[];
  allProducts: Product[];
}
