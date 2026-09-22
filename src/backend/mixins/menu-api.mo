import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import MenuTypes "../types/menu";
import MenuLib "../lib/menu";

mixin (
  accessControlState : AccessControl.AccessControlState,
  categories : Map.Map<Common.Id, MenuTypes.Category>,
  products : Map.Map<Common.Id, MenuTypes.Product>,
  sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
  addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
  counters : { var nextMenuId : Nat; var nextOrderSeq : Nat; var orderDate : Text },
) {
  /// Public storefront menu.
  public query func getMenu() : async MenuTypes.Menu {
    MenuLib.getMenu(categories, products, sizeOptions, addOns);
  };

  /// Public product lookup.
  public query func getProduct(id : Common.Id) : async ?MenuTypes.Product {
    MenuLib.getProduct(products, id);
  };

  /// Admin: create a product.
  public shared ({ caller }) func createProduct(input : MenuTypes.ProductInput) : async Common.Id {
    requireAdmin(accessControlState, caller);
    MenuLib.createProduct(products, counters, input);
  };

  /// Admin: update a product.
  public shared ({ caller }) func updateProduct(id : Common.Id, input : MenuTypes.ProductInput) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.updateProduct(products, id, input);
  };

  /// Admin: delete a product.
  public shared ({ caller }) func deleteProduct(id : Common.Id) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.deleteProduct(products, id);
  };

  /// Admin: create a category.
  public shared ({ caller }) func createCategory(input : MenuTypes.CategoryInput) : async Common.Id {
    requireAdmin(accessControlState, caller);
    MenuLib.createCategory(categories, counters, input);
  };

  /// Admin: update a category.
  public shared ({ caller }) func updateCategory(id : Common.Id, input : MenuTypes.CategoryInput) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.updateCategory(categories, id, input);
  };

  /// Admin: delete a category.
  public shared ({ caller }) func deleteCategory(id : Common.Id) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.deleteCategory(categories, id);
  };

  /// Admin: create a size option.
  public shared ({ caller }) func createSizeOption(input : MenuTypes.SizeOptionInput) : async Common.Id {
    requireAdmin(accessControlState, caller);
    MenuLib.createSizeOption(sizeOptions, counters, input);
  };

  /// Admin: update a size option.
  public shared ({ caller }) func updateSizeOption(id : Common.Id, input : MenuTypes.SizeOptionInput) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.updateSizeOption(sizeOptions, id, input);
  };

  /// Admin: delete a size option.
  public shared ({ caller }) func deleteSizeOption(id : Common.Id) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.deleteSizeOption(sizeOptions, id);
  };

  /// Admin: create an add-on.
  public shared ({ caller }) func createAddOn(input : MenuTypes.AddOnInput) : async Common.Id {
    requireAdmin(accessControlState, caller);
    MenuLib.createAddOn(addOns, counters, input);
  };

  /// Admin: update an add-on.
  public shared ({ caller }) func updateAddOn(id : Common.Id, input : MenuTypes.AddOnInput) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.updateAddOn(addOns, id, input);
  };

  /// Admin: delete an add-on.
  public shared ({ caller }) func deleteAddOn(id : Common.Id) : async Bool {
    requireAdmin(accessControlState, caller);
    MenuLib.deleteAddOn(addOns, id);
  };

  func requireAdmin(state : AccessControl.AccessControlState, caller : Principal) : () {
    if (not AccessControl.hasPermission(state, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };
};
