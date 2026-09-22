import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import MenuTypes "../types/menu";
import OrderTypes "../types/orders";
import OrdersLib "../lib/orders";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.Id, MenuTypes.Product>,
  sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
  addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
  orders : Map.Map<Text, OrderTypes.Order>,
  paymentSettings : { var settings : OrderTypes.PaymentSettings },
  counters : { var nextMenuId : Nat; var nextOrderSeq : Nat; var orderDate : Text },
) {
  /// Place an order. Open to any caller, including anonymous guests.
  public shared ({ caller }) func placeOrder(input : OrderTypes.PlaceOrderInput) : async Result.Result<Text, OrderTypes.OrderError> {
    ignore caller;
    OrdersLib.placeOrder(products, sizeOptions, addOns, orders, counters, input);
  };

  /// Track an order by its order number.
  public query func getOrder(orderNumber : Text) : async ?OrderTypes.Order {
    OrdersLib.getOrder(orders, orderNumber);
  };

  /// Admin: list orders, optionally filtered.
  public query ({ caller }) func listOrders(filter : OrderTypes.OrderFilter) : async [OrderTypes.OrderSummary] {
    requireAdminOrders(accessControlState, caller);
    OrdersLib.listOrders(orders, filter);
  };

  /// Admin: change an order's status.
  public shared ({ caller }) func updateOrderStatus(orderNumber : Text, status : OrderTypes.OrderStatus) : async Result.Result<OrderTypes.Order, OrderTypes.OrderError> {
    requireAdminOrders(accessControlState, caller);
    OrdersLib.updateOrderStatus(orders, orderNumber, status);
  };

  /// Admin: cancel an order.
  public shared ({ caller }) func cancelOrder(orderNumber : Text) : async Result.Result<OrderTypes.Order, OrderTypes.OrderError> {
    requireAdminOrders(accessControlState, caller);
    OrdersLib.cancelOrder(orders, orderNumber);
  };

  /// Admin: verify a GCash/Maya payment.
  public shared ({ caller }) func verifyPayment(orderNumber : Text) : async Result.Result<OrderTypes.Order, OrderTypes.OrderError> {
    requireAdminOrders(accessControlState, caller);
    OrdersLib.verifyPayment(orders, orderNumber);
  };

  /// Admin: dashboard counters.
  public query ({ caller }) func getDashboardStats() : async OrderTypes.DashboardStats {
    requireAdminOrders(accessControlState, caller);
    OrdersLib.getDashboardStats(orders);
  };

  /// Public: configurable shop payment settings.
  public query func getPaymentSettings() : async OrderTypes.PaymentSettings {
    OrdersLib.getPaymentSettings(paymentSettings);
  };

  /// Admin: update shop payment settings.
  public shared ({ caller }) func updatePaymentSettings(input : OrderTypes.PaymentSettingsInput) : async OrderTypes.PaymentSettings {
    requireAdminOrders(accessControlState, caller);
    OrdersLib.updatePaymentSettings(paymentSettings, input);
  };

  func requireAdminOrders(state : AccessControl.AccessControlState, caller : Principal) : () {
    if (not AccessControl.hasPermission(state, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };
};
