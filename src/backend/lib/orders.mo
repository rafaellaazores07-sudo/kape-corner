import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Result "mo:core/Result";
import Common "../types/common";
import MenuTypes "../types/menu";
import OrderTypes "../types/orders";

module {
  /// Flat service fee charged on every order, in centavos (₱10.00).
  let serviceFee : Common.Centavos = 1000;

  /// Validate the submitted order and compute subtotal, service fee, and total.
  public func priceOrder(
    products : Map.Map<Common.Id, MenuTypes.Product>,
    sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
    addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
    input : OrderTypes.PlaceOrderInput,
  ) : Result.Result<OrderTypes.Order, OrderTypes.OrderError> {
    if (input.items.size() == 0) {
      return #err(#emptyCart);
    };

    // Customer information validation.
    if (input.customer.fullName.size() == 0) {
      return #err(#invalidCustomerInfo("Full name is required"));
    };
    if (input.customer.mobileNumber.size() == 0) {
      return #err(#invalidCustomerInfo("Mobile number is required"));
    };
    if (input.customer.email.size() == 0) {
      return #err(#invalidCustomerInfo("Email address is required"));
    };

    // Order type validation.
    switch (input.orderType) {
      case (#dineIn) {
        switch (input.dineIn) {
          case null { return #err(#invalidOrderType("Table number is required for dine-in")) };
          case (?d) {
            if (d.tableNumber.size() == 0) {
              return #err(#invalidOrderType("Table number is required for dine-in"));
            };
            if (d.numberOfCustomers == 0) {
              return #err(#invalidOrderType("Number of customers must be at least 1"));
            };
          };
        };
      };
      case (#takeOut) {
        switch (input.takeOut) {
          case null { return #err(#invalidOrderType("Pickup time is required for take-out")) };
          case (?t) {
            if (t.pickupTime.size() == 0) {
              return #err(#invalidOrderType("Pickup time is required for take-out"));
            };
          };
        };
      };
    };

    // Payment validation.
    switch (input.payment.method) {
      case (#gcash or #maya) {
        switch (input.payment.referenceNumber) {
          case null { return #err(#invalidPayment("A payment reference number is required")) };
          case (?ref) {
            if (ref.size() == 0) {
              return #err(#invalidPayment("A payment reference number is required"));
            };
          };
        };
      };
      case (#cash) {};
    };

    // Price every line from the authoritative menu data.
    var subtotal : Common.Centavos = 0;
    let pricedItems = input.items.map(
      func (item) : Result.Result<OrderTypes.OrderItem, OrderTypes.OrderError> {
        if (item.quantity == 0) {
          return #err(#invalidCustomerInfo("Item quantity must be at least 1"));
        };
        let product = switch (products.get(item.productId)) {
          case null { return #err(#unknownProduct(item.productId)) };
          case (?p) { p };
        };
        if (not product.available) {
          return #err(#productUnavailable(item.productId));
        };

        var unitPrice = product.price;

        // Size surcharge.
        switch (item.customization.sizeId) {
          case null {};
          case (?sizeId) {
            switch (sizeOptions.get(sizeId)) {
              case null { return #err(#invalidCustomerInfo("Unknown size option")) };
              case (?s) { unitPrice += s.surcharge };
            };
          };
        };

        // Add-on surcharges.
        for (addOnId in item.customization.addOnIds.values()) {
          switch (addOns.get(addOnId)) {
            case null { return #err(#invalidCustomerInfo("Unknown add-on")) };
            case (?a) { unitPrice += a.price };
          };
        };

        let lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        #ok({
          productId = product.id;
          productName = product.name;
          quantity = item.quantity;
          unitPrice;
          lineTotal;
          customization = item.customization;
        });
      },
    );

    // Collect the first error, if any.
    let items = switch (collectItems(pricedItems)) {
      case (#err e) { return #err(e) };
      case (#ok is) { is };
    };

    let total = subtotal + serviceFee;
    let now = nowNs();

    #ok({
      orderNumber = "";
      customer = input.customer;
      orderType = input.orderType;
      dineIn = input.dineIn;
      takeOut = input.takeOut;
      specialInstructions = input.specialInstructions;
      items;
      subtotal;
      serviceFee;
      total;
      payment = input.payment;
      status = #orderReceived;
      createdAt = now;
      updatedAt = now;
    });
  };

  /// Fold a list of per-line results into a single result.
  func collectItems(
    results : [Result.Result<OrderTypes.OrderItem, OrderTypes.OrderError>],
  ) : Result.Result<[OrderTypes.OrderItem], OrderTypes.OrderError> {
    let items = results.map(
      func (r) : OrderTypes.OrderItem {
        switch (r) {
          case (#ok item) { item };
          case (#err _) { { productId = 0; productName = ""; quantity = 0; unitPrice = 0; lineTotal = 0; customization = { sizeId = null; sugarLevel = null; iceLevel = null; milkOption = null; addOnIds = [] } } };
        };
      },
    );
    switch (results.find(func (r) = switch (r) { case (#err _) true; case (#ok _) false })) {
      case (?r) {
        switch (r) {
          case (#err e) { #err(e) };
          case (#ok _) { #ok(items) };
        };
      };
      case null { #ok(items) };
    };
  };

  /// Persist a priced order and return its generated order number.
  public func placeOrder(
    products : Map.Map<Common.Id, MenuTypes.Product>,
    sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
    addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
    orders : Map.Map<Text, OrderTypes.Order>,
    counters : { var nextMenuId : Nat; var nextOrderSeq : Nat; var orderDate : Text },
    input : OrderTypes.PlaceOrderInput,
  ) : Result.Result<Text, OrderTypes.OrderError> {
    let priced = switch (priceOrder(products, sizeOptions, addOns, input)) {
      case (#err e) { return #err(e) };
      case (#ok o) { o };
    };

    let now = nowNs();
    let date = formatDate(now);
    if (counters.orderDate != date) {
      counters.orderDate := date;
      counters.nextOrderSeq := 1;
    };
    let seq = counters.nextOrderSeq;
    counters.nextOrderSeq := seq + 1;

    let orderNumber = "ORDER #" # date # "-" # pad3(seq);
    let order : OrderTypes.Order = { priced with orderNumber };
    orders.add(orderNumber, order);
    #ok(orderNumber);
  };

  /// Look up an order by its order number.
  public func getOrder(
    orders : Map.Map<Text, OrderTypes.Order>,
    orderNumber : Text,
  ) : ?OrderTypes.Order {
    orders.get(orderNumber);
  };

  /// List orders, optionally filtered by status and order type.
  public func listOrders(
    orders : Map.Map<Text, OrderTypes.Order>,
    filter : OrderTypes.OrderFilter,
  ) : [OrderTypes.OrderSummary] {
    let all = orders.values().toArray();
    let filtered = all.filter(
      func (o) {
        let statusOk = switch (filter.status) {
          case null { true };
          case (?s) { statusEq(o.status, s) };
        };
        let typeOk = switch (filter.orderType) {
          case null { true };
          case (?t) { typeEq(o.orderType, t) };
        };
        statusOk and typeOk;
      },
    );
    let sorted = filtered.sort(
      func (a, b) {
        if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal };
      },
    );
    sorted.map(
      func (o) : OrderTypes.OrderSummary {
        {
          orderNumber = o.orderNumber;
          customerName = o.customer.fullName;
          orderType = o.orderType;
          total = o.total;
          paymentMethod = o.payment.method;
          status = o.status;
          createdAt = o.createdAt;
        };
      },
    );
  };

  /// Move an order to a new status.
  public func updateOrderStatus(
    orders : Map.Map<Text, OrderTypes.Order>,
    orderNumber : Text,
    status : OrderTypes.OrderStatus,
  ) : Result.Result<OrderTypes.Order, OrderTypes.OrderError> {
    let order = switch (orders.get(orderNumber)) {
      case null { return #err(#unknownOrder(orderNumber)) };
      case (?o) { o };
    };
    if (not isValidTransition(order.status, status)) {
      return #err(#invalidStatusTransition({ from = order.status; to = status }));
    };
    let updated : OrderTypes.Order = { order with status; updatedAt = nowNs() };
    orders.add(orderNumber, updated);
    #ok(updated);
  };

  /// Cancel an order.
  public func cancelOrder(
    orders : Map.Map<Text, OrderTypes.Order>,
    orderNumber : Text,
  ) : Result.Result<OrderTypes.Order, OrderTypes.OrderError> {
    let order = switch (orders.get(orderNumber)) {
      case null { return #err(#unknownOrder(orderNumber)) };
      case (?o) { o };
    };
    if (not isCancellable(order.status)) {
      return #err(#invalidStatusTransition({ from = order.status; to = #cancelled }));
    };
    let updated : OrderTypes.Order = { order with status = #cancelled; updatedAt = nowNs() };
    orders.add(orderNumber, updated);
    #ok(updated);
  };

  /// Mark a GCash/Maya payment as verified.
  public func verifyPayment(
    orders : Map.Map<Text, OrderTypes.Order>,
    orderNumber : Text,
  ) : Result.Result<OrderTypes.Order, OrderTypes.OrderError> {
    let order = switch (orders.get(orderNumber)) {
      case null { return #err(#unknownOrder(orderNumber)) };
      case (?o) { o };
    };
    switch (order.payment.method) {
      case (#cash) { return #err(#invalidPayment("Cash orders do not require payment verification")) };
      case (#gcash or #maya) {};
    };
    if (not statusEq(order.status, #paymentVerification)) {
      return #err(#invalidStatusTransition({ from = order.status; to = #orderConfirmed }));
    };
    let updated : OrderTypes.Order = { order with status = #orderConfirmed; updatedAt = nowNs() };
    orders.add(orderNumber, updated);
    #ok(updated);
  };

  /// Compute the admin dashboard counters.
  public func getDashboardStats(
    orders : Map.Map<Text, OrderTypes.Order>,
  ) : OrderTypes.DashboardStats {
    let all = orders.values().toArray();
    let today = formatDate(nowNs());
    var totalOrders = 0;
    var pendingOrders = 0;
    var completedOrders = 0;
    var todaysSales : Common.Centavos = 0;
    var totalSales : Common.Centavos = 0;
    for (o in all.values()) {
      totalOrders += 1;
      if (isPending(o.status)) { pendingOrders += 1 };
      if (statusEq(o.status, #completed)) { completedOrders += 1 };
      if (not statusEq(o.status, #cancelled)) {
        totalSales += o.total;
        if (formatDate(o.createdAt) == today) { todaysSales += o.total };
      };
    };
    { totalOrders; pendingOrders; completedOrders; todaysSales; totalSales };
  };

  /// Read the configurable shop payment settings.
  public func getPaymentSettings(
    paymentSettings : { var settings : OrderTypes.PaymentSettings },
  ) : OrderTypes.PaymentSettings {
    paymentSettings.settings;
  };

  /// Update the configurable shop payment settings.
  public func updatePaymentSettings(
    paymentSettings : { var settings : OrderTypes.PaymentSettings },
    input : OrderTypes.PaymentSettingsInput,
  ) : OrderTypes.PaymentSettings {
    let updated : OrderTypes.PaymentSettings = {
      gcashNumber = input.gcashNumber;
      gcashQr = input.gcashQr;
      mayaNumber = input.mayaNumber;
      mayaQr = input.mayaQr;
    };
    paymentSettings.settings := updated;
    updated;
  };

  // --- helpers ---

  /// Current wall-clock time in nanoseconds since the Unix epoch.
  func nowNs() : Common.Timestamp {
    Int.abs(Time.now());
  };

  func statusEq(a : OrderTypes.OrderStatus, b : OrderTypes.OrderStatus) : Bool {
    switch (a, b) {
      case (#orderReceived, #orderReceived) { true };
      case (#paymentVerification, #paymentVerification) { true };
      case (#orderConfirmed, #orderConfirmed) { true };
      case (#preparing, #preparing) { true };
      case (#readyForPickup, #readyForPickup) { true };
      case (#completed, #completed) { true };
      case (#cancelled, #cancelled) { true };
      case _ { false };
    };
  };

  func typeEq(a : OrderTypes.OrderType, b : OrderTypes.OrderType) : Bool {
    switch (a, b) {
      case (#dineIn, #dineIn) { true };
      case (#takeOut, #takeOut) { true };
      case _ { false };
    };
  };

  func isPending(status : OrderTypes.OrderStatus) : Bool {
    switch (status) {
      case (#orderReceived or #paymentVerification or #orderConfirmed or #preparing or #readyForPickup) { true };
      case (#completed or #cancelled) { false };
    };
  };

  func isCancellable(status : OrderTypes.OrderStatus) : Bool {
    switch (status) {
      case (#orderReceived or #paymentVerification or #orderConfirmed or #preparing) { true };
      case (#readyForPickup or #completed or #cancelled) { false };
    };
  };

  func isValidTransition(from : OrderTypes.OrderStatus, to : OrderTypes.OrderStatus) : Bool {
    switch (from, to) {
      case (#orderReceived, #paymentVerification) { true };
      case (#orderReceived, #orderConfirmed) { true };
      case (#paymentVerification, #orderConfirmed) { true };
      case (#orderConfirmed, #preparing) { true };
      case (#preparing, #readyForPickup) { true };
      case (#readyForPickup, #completed) { true };
      case _ { false };
    };
  };

  /// Format a nanosecond timestamp as YYYYMMDD (UTC).
  func formatDate(ns : Common.Timestamp) : Text {
    let seconds = ns / 1_000_000_000;
    let days = seconds / 86_400;
    let (y, m, d) = civilFromDays(days);
    pad4(y) # pad2(m) # pad2(d);
  };

  /// Convert days since the Unix epoch to a civil (year, month, day) date.
  func civilFromDays(z0 : Nat) : (Nat, Nat, Nat) {
    let z = z0 + 719_468;
    let era = z / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year = if (m <= 2) { y + 1 } else { y };
    (year, m, d);
  };

  func pad2(n : Nat) : Text {
    if (n < 10) { "0" # n.toText() } else { n.toText() };
  };

  func pad3(n : Nat) : Text {
    if (n < 10) { "00" # n.toText() }
    else if (n < 100) { "0" # n.toText() }
    else { n.toText() };
  };

  func pad4(n : Nat) : Text {
    if (n < 10) { "000" # n.toText() }
    else if (n < 100) { "00" # n.toText() }
    else if (n < 1000) { "0" # n.toText() }
    else { n.toText() };
  };
};
