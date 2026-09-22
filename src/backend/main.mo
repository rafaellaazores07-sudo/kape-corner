import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import MenuTypes "types/menu";
import OrderTypes "types/orders";
import MenuApi "mixins/menu-api";
import OrdersApi "mixins/orders-api";
import AccountsApi "mixins/accounts-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  let categories : Map.Map<Nat, MenuTypes.Category>;
  let products : Map.Map<Nat, MenuTypes.Product>;
  let sizeOptions : Map.Map<Nat, MenuTypes.SizeOption>;
  let addOns : Map.Map<Nat, MenuTypes.AddOn>;
  let orders : Map.Map<Text, OrderTypes.Order>;
  let paymentSettings : { var settings : OrderTypes.PaymentSettings };
  let counters : { var nextMenuId : Nat; var nextOrderSeq : Nat; var orderDate : Text };

  include MenuApi(accessControlState, categories, products, sizeOptions, addOns, counters);
  include OrdersApi(accessControlState, products, sizeOptions, addOns, orders, paymentSettings, counters);
  include AccountsApi(accessControlState);
  include ApiDocMixin();

  include Expose({
    entities = [
      categories.toEntity("category", "Category", "id")
        .sample({ id = 0; name = ""; sortOrder = 0 })
        .public_()
        .build(),
      products.toEntityManual("product", "Product", "id")
        .sample({ id = 0; categoryId = 0; name = ""; description = ""; price = 0; image = null; available = true; sizeOptionIds = []; addOnIds = [] })
        .payload("id", func p = p.id)
        .payload("categoryId", func p = p.categoryId)
        .payload("name", func p = p.name)
        .payload("description", func p = p.description)
        .payload("price", func p = p.price)
        .payload("image", func p = switch (p.image) { case null { "" }; case (?f) { f.filename } })
        .payload("available", func p = p.available)
        .payload("sizeOptionIds", func p = p.sizeOptionIds.values().map(func id = id.toText()).join(","))
        .payload("addOnIds", func p = p.addOnIds.values().map(func id = id.toText()).join(","))
        .public_()
        .build(),
      sizeOptions.toEntity("sizeOption", "SizeOption", "id")
        .sample({ id = 0; name = ""; surcharge = 0 })
        .public_()
        .build(),
      addOns.toEntity("addOn", "AddOn", "id")
        .sample({ id = 0; name = ""; price = 0; available = true })
        .public_()
        .build(),
      orders.toEntityManual("order", "Order", "orderNumber")
        .sample({
          orderNumber = "";
          customer = { fullName = ""; mobileNumber = ""; email = "" };
          orderType = #takeOut;
          dineIn = null;
          takeOut = null;
          specialInstructions = "";
          items = [];
          subtotal = 0;
          serviceFee = 0;
          total = 0;
          payment = { method = #cash; referenceNumber = null; proof = null };
          status = #orderReceived;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("orderNumber", func o = o.orderNumber)
        .flatten(func o = o.customer)
        .payload("orderType", func o = switch (o.orderType) { case (#dineIn) { "dineIn" }; case (#takeOut) { "takeOut" } })
        .payload("tableNumber", func o = switch (o.dineIn) { case null { "" }; case (?d) { d.tableNumber } })
        .payload("numberOfCustomers", func o = switch (o.dineIn) { case null { 0 }; case (?d) { d.numberOfCustomers } })
        .payload("pickupTime", func o = switch (o.takeOut) { case null { "" }; case (?t) { t.pickupTime } })
        .payload("specialInstructions", func o = o.specialInstructions)
        .payload("itemCount", func o = o.items.size())
        .payload("subtotal", func o = o.subtotal)
        .payload("serviceFee", func o = o.serviceFee)
        .payload("total", func o = o.total)
        .payload("paymentMethod", func o = switch (o.payment.method) { case (#gcash) { "gcash" }; case (#maya) { "maya" }; case (#cash) { "cash" } })
        .payload("referenceNumber", func o = o.payment.referenceNumber ?? "")
        .payload("status", func o = switch (o.status) { case (#orderReceived) { "orderReceived" }; case (#paymentVerification) { "paymentVerification" }; case (#orderConfirmed) { "orderConfirmed" }; case (#preparing) { "preparing" }; case (#readyForPickup) { "readyForPickup" }; case (#completed) { "completed" }; case (#cancelled) { "cancelled" } })
        .payload("createdAt", func o = o.createdAt)
        .payload("updatedAt", func o = o.updatedAt)
        .controllerOnly()
        .build(),
    ];
  });
};
