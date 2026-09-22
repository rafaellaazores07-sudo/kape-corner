import Common "common";

module {
  /// A menu category such as Hot Coffee, Iced Coffee, Non-Coffee, or Pastries & Snacks.
  public type Category = {
    id : Common.Id;
    name : Text;
    sortOrder : Nat;
  };

  /// A drink size. Surcharge is added to the base price.
  public type SizeOption = {
    id : Common.Id;
    name : Text;
    surcharge : Common.Centavos;
  };

  /// A purchasable extra (extra shot, extra syrup, whipped cream, milk swap, ...).
  public type AddOn = {
    id : Common.Id;
    name : Text;
    price : Common.Centavos;
    available : Bool;
  };

  /// A menu product.
  public type Product = {
    id : Common.Id;
    categoryId : Common.Id;
    name : Text;
    description : Text;
    price : Common.Centavos;
    image : ?Common.StoredFile;
    available : Bool;
    sizeOptionIds : [Common.Id];
    addOnIds : [Common.Id];
  };

  /// The full menu payload returned to the storefront.
  public type Menu = {
    categories : [Category];
    products : [Product];
    sizes : [SizeOption];
    addOns : [AddOn];
  };

  /// Input for creating or updating a product.
  public type ProductInput = {
    categoryId : Common.Id;
    name : Text;
    description : Text;
    price : Common.Centavos;
    image : ?Common.StoredFile;
    available : Bool;
    sizeOptionIds : [Common.Id];
    addOnIds : [Common.Id];
  };

  /// Input for creating or updating a category.
  public type CategoryInput = {
    name : Text;
    sortOrder : Nat;
  };

  /// Input for creating or updating a size option.
  public type SizeOptionInput = {
    name : Text;
    surcharge : Common.Centavos;
  };

  /// Input for creating or updating an add-on.
  public type AddOnInput = {
    name : Text;
    price : Common.Centavos;
    available : Bool;
  };
};
