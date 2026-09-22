import Common "common";

module {
  /// Whether the order is eaten in the shop or taken away.
  public type OrderType = {
    #dineIn;
    #takeOut;
  };

  /// The lifecycle stage of an order.
  public type OrderStatus = {
    #orderReceived;
    #paymentVerification;
    #orderConfirmed;
    #preparing;
    #readyForPickup;
    #completed;
    #cancelled;
  };

  /// How the customer pays.
  public type PaymentMethod = {
    #gcash;
    #maya;
    #cash;
  };

  /// A chosen customization on a cart line.
  public type LineCustomization = {
    sizeId : ?Common.Id;
    sugarLevel : ?Text;
    iceLevel : ?Text;
    milkOption : ?Text;
    addOnIds : [Common.Id];
  };

  /// A single line of an order.
  public type OrderItem = {
    productId : Common.Id;
    productName : Text;
    quantity : Nat;
    unitPrice : Common.Centavos;
    lineTotal : Common.Centavos;
    customization : LineCustomization;
  };

  /// Customer-supplied details for a dine-in order.
  public type DineInDetails = {
    tableNumber : Text;
    numberOfCustomers : Nat;
  };

  /// Customer-supplied details for a take-out order.
  public type TakeOutDetails = {
    pickupTime : Text;
  };

  /// Customer contact information collected at checkout.
  public type CustomerInfo = {
    fullName : Text;
    mobileNumber : Text;
    email : Text;
  };

  /// Payment details supplied by the customer.
  public type PaymentInfo = {
    method : PaymentMethod;
    referenceNumber : ?Text;
    proof : ?Common.StoredFile;
  };

  /// A complete order as stored and returned to the storefront.
  public type Order = {
    orderNumber : Text;
    customer : CustomerInfo;
    orderType : OrderType;
    dineIn : ?DineInDetails;
    takeOut : ?TakeOutDetails;
    specialInstructions : Text;
    items : [OrderItem];
    subtotal : Common.Centavos;
    serviceFee : Common.Centavos;
    total : Common.Centavos;
    payment : PaymentInfo;
    status : OrderStatus;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  /// The payload submitted when placing an order.
  public type PlaceOrderInput = {
    customer : CustomerInfo;
    orderType : OrderType;
    dineIn : ?DineInDetails;
    takeOut : ?TakeOutDetails;
    specialInstructions : Text;
    items : [OrderItem];
    payment : PaymentInfo;
  };

  /// A compact order summary for list views.
  public type OrderSummary = {
    orderNumber : Text;
    customerName : Text;
    orderType : OrderType;
    total : Common.Centavos;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    createdAt : Common.Timestamp;
  };

  /// Aggregate counters shown on the admin dashboard.
  public type DashboardStats = {
    totalOrders : Nat;
    pendingOrders : Nat;
    completedOrders : Nat;
    todaysSales : Common.Centavos;
    totalSales : Common.Centavos;
  };

  /// Filter applied to the admin order list.
  public type OrderFilter = {
    status : ?OrderStatus;
    orderType : ?OrderType;
  };

  /// Configurable shop payment settings (GCash / Maya placeholders and QR codes).
  public type PaymentSettings = {
    gcashNumber : Text;
    gcashQr : ?Common.StoredFile;
    mayaNumber : Text;
    mayaQr : ?Common.StoredFile;
  };

  /// Input for updating shop payment settings.
  public type PaymentSettingsInput = {
    gcashNumber : Text;
    gcashQr : ?Common.StoredFile;
    mayaNumber : Text;
    mayaQr : ?Common.StoredFile;
  };

  /// A failure a caller can act on when placing or managing an order.
  public type OrderError = {
    #emptyCart;
    #invalidCustomerInfo : Text;
    #invalidOrderType : Text;
    #invalidPayment : Text;
    #unknownProduct : Common.Id;
    #productUnavailable : Common.Id;
    #unknownOrder : Text;
    #invalidStatusTransition : { from : OrderStatus; to : OrderStatus };
    #notAuthorized;
  };
};
