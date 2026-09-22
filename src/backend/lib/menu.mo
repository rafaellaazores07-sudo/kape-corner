import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Common "../types/common";
import MenuTypes "../types/menu";

module {
  /// Return the full menu (categories, products, sizes, add-ons).
  public func getMenu(
    categories : Map.Map<Common.Id, MenuTypes.Category>,
    products : Map.Map<Common.Id, MenuTypes.Product>,
    sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
    addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
  ) : MenuTypes.Menu {
    {
      categories = categories.values().toArray();
      products = products.values().toArray();
      sizes = sizeOptions.values().toArray();
      addOns = addOns.values().toArray();
    };
  };

  /// Return a single product by id.
  public func getProduct(
    products : Map.Map<Common.Id, MenuTypes.Product>,
    id : Common.Id,
  ) : ?MenuTypes.Product {
    products.get(id);
  };

  /// Create a product and return its new id.
  public func createProduct(
    products : Map.Map<Common.Id, MenuTypes.Product>,
    counters : { var nextMenuId : Nat },
    input : MenuTypes.ProductInput,
  ) : Common.Id {
    let id = counters.nextMenuId;
    counters.nextMenuId := id + 1;
    products.add(id, {
      id;
      categoryId = input.categoryId;
      name = input.name;
      description = input.description;
      price = input.price;
      image = input.image;
      available = input.available;
      sizeOptionIds = input.sizeOptionIds;
      addOnIds = input.addOnIds;
    });
    id;
  };

  /// Update an existing product.
  public func updateProduct(
    products : Map.Map<Common.Id, MenuTypes.Product>,
    id : Common.Id,
    input : MenuTypes.ProductInput,
  ) : Bool {
    switch (products.get(id)) {
      case null { false };
      case (?_) {
        products.add(id, {
          id;
          categoryId = input.categoryId;
          name = input.name;
          description = input.description;
          price = input.price;
          image = input.image;
          available = input.available;
          sizeOptionIds = input.sizeOptionIds;
          addOnIds = input.addOnIds;
        });
        true;
      };
    };
  };

  /// Delete a product.
  public func deleteProduct(
    products : Map.Map<Common.Id, MenuTypes.Product>,
    id : Common.Id,
  ) : Bool {
    switch (products.get(id)) {
      case null { false };
      case (?_) {
        products.remove(id);
        true;
      };
    };
  };

  /// Create a category and return its new id.
  public func createCategory(
    categories : Map.Map<Common.Id, MenuTypes.Category>,
    counters : { var nextMenuId : Nat },
    input : MenuTypes.CategoryInput,
  ) : Common.Id {
    let id = counters.nextMenuId;
    counters.nextMenuId := id + 1;
    categories.add(id, { id; name = input.name; sortOrder = input.sortOrder });
    id;
  };

  /// Update an existing category.
  public func updateCategory(
    categories : Map.Map<Common.Id, MenuTypes.Category>,
    id : Common.Id,
    input : MenuTypes.CategoryInput,
  ) : Bool {
    switch (categories.get(id)) {
      case null { false };
      case (?_) {
        categories.add(id, { id; name = input.name; sortOrder = input.sortOrder });
        true;
      };
    };
  };

  /// Delete a category.
  public func deleteCategory(
    categories : Map.Map<Common.Id, MenuTypes.Category>,
    id : Common.Id,
  ) : Bool {
    switch (categories.get(id)) {
      case null { false };
      case (?_) {
        categories.remove(id);
        true;
      };
    };
  };

  /// Create a size option and return its new id.
  public func createSizeOption(
    sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
    counters : { var nextMenuId : Nat },
    input : MenuTypes.SizeOptionInput,
  ) : Common.Id {
    let id = counters.nextMenuId;
    counters.nextMenuId := id + 1;
    sizeOptions.add(id, { id; name = input.name; surcharge = input.surcharge });
    id;
  };

  /// Update an existing size option.
  public func updateSizeOption(
    sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
    id : Common.Id,
    input : MenuTypes.SizeOptionInput,
  ) : Bool {
    switch (sizeOptions.get(id)) {
      case null { false };
      case (?_) {
        sizeOptions.add(id, { id; name = input.name; surcharge = input.surcharge });
        true;
      };
    };
  };

  /// Delete a size option.
  public func deleteSizeOption(
    sizeOptions : Map.Map<Common.Id, MenuTypes.SizeOption>,
    id : Common.Id,
  ) : Bool {
    switch (sizeOptions.get(id)) {
      case null { false };
      case (?_) {
        sizeOptions.remove(id);
        true;
      };
    };
  };

  /// Create an add-on and return its new id.
  public func createAddOn(
    addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
    counters : { var nextMenuId : Nat },
    input : MenuTypes.AddOnInput,
  ) : Common.Id {
    let id = counters.nextMenuId;
    counters.nextMenuId := id + 1;
    addOns.add(id, { id; name = input.name; price = input.price; available = input.available });
    id;
  };

  /// Update an existing add-on.
  public func updateAddOn(
    addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
    id : Common.Id,
    input : MenuTypes.AddOnInput,
  ) : Bool {
    switch (addOns.get(id)) {
      case null { false };
      case (?_) {
        addOns.add(id, { id; name = input.name; price = input.price; available = input.available });
        true;
      };
    };
  };

  /// Delete an add-on.
  public func deleteAddOn(
    addOns : Map.Map<Common.Id, MenuTypes.AddOn>,
    id : Common.Id,
  ) : Bool {
    switch (addOns.get(id)) {
      case null { false };
      case (?_) {
        addOns.remove(id);
        true;
      };
    };
  };
};
